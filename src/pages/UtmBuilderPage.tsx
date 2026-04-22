import { useEffect, useMemo, useState } from "react";
import { analyticsGoals, trackGoal } from "../lib/analytics";
import { applyMetadata } from "../lib/metadata";
import {
  buildUtmParameterString,
  buildUtmUrl,
  defaultUtmInputs,
  normalizeUtmInput,
  type UtmInputs,
  validateUtmInputs,
} from "../lib/utmBuilder";

const mediumPresets = ["email", "paid_social", "cpc", "display", "affiliate"];
const sourcePresets = ["google", "meta", "telegram", "newsletter", "linkedin"];

const copyText = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
};

type UtmFieldProps = {
  assist?: string;
  error?: string;
  label: string;
  name: keyof UtmInputs;
  onBlur: (name: keyof UtmInputs) => void;
  onChange: (name: keyof UtmInputs, value: string) => void;
  placeholder: string;
  value: string;
};

function UtmField({
  assist,
  error,
  label,
  name,
  onBlur,
  onChange,
  placeholder,
  value,
}: UtmFieldProps) {
  const inputId = `utm-${name}`;

  return (
    <label className={`utm-field${error ? " utm-field--error" : ""}`} htmlFor={inputId}>
      <span className="utm-field__label">{label}</span>
      <input
        id={inputId}
        name={name}
        onBlur={() => onBlur(name)}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
      <span className="utm-field__assist">{error ?? assist}</span>
    </label>
  );
}

export function UtmBuilderPage() {
  const [inputs, setInputs] = useState<UtmInputs>(defaultUtmInputs);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hasTrackedEdit, setHasTrackedEdit] = useState(false);

  const validation = useMemo(() => validateUtmInputs(inputs), [inputs]);
  const generatedUrl = useMemo(() => buildUtmUrl(inputs), [inputs]);
  const parameterString = useMemo(() => buildUtmParameterString(inputs), [inputs]);
  const qualityScore = Math.max(
    0,
    100 -
      Object.keys(validation.errors).length * 26 -
      validation.warnings.length * 8,
  );

  useEffect(() => {
    applyMetadata({
      title: "UTM Builder — Incrementality Lab",
      description:
        "Create clean UTM links with validation, normalization, and one-click copying.",
      url: "https://lab.mzhirnov.com/utm-builder",
      image: "https://lab.mzhirnov.com/og/home.png",
    });
  }, []);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const updateInput = (name: keyof UtmInputs, value: string) => {
    if (!hasTrackedEdit) {
      trackGoal(analyticsGoals.utmBuilderAdjusted);
      setHasTrackedEdit(true);
    }

    setInputs((currentInputs) => ({
      ...currentInputs,
      [name]: value,
    }));
  };

  const normalizeInput = (name: keyof UtmInputs) => {
    setInputs((currentInputs) => ({
      ...currentInputs,
      [name]: normalizeUtmInput(name, currentInputs[name]),
    }));
  };

  const applyPreset = (name: keyof UtmInputs, value: string) => {
    updateInput(name, value);
  };

  const handleCopyUrl = async () => {
    if (!generatedUrl || !validation.isValid) {
      setFeedback("Fix the required fields first");
      return;
    }

    try {
      await copyText(generatedUrl);
      trackGoal(analyticsGoals.utmBuilderUrlCopied);
      setFeedback("UTM link copied");
    } catch {
      setFeedback("Could not copy link");
    }
  };

  const handleCopyParams = async () => {
    if (!parameterString) {
      setFeedback("Add UTM values first");
      return;
    }

    try {
      await copyText(parameterString);
      trackGoal(analyticsGoals.utmBuilderParamsCopied);
      setFeedback("Parameters copied");
    } catch {
      setFeedback("Could not copy parameters");
    }
  };

  return (
    <div className="utm-shell">
      <header className="utm-hero">
        <div>
          <span className="eyebrow">UTM Builder</span>
          <h1>Clean campaign links without the spreadsheet mess</h1>
          <p>
            Build tagged URLs, keep naming consistent, and catch mistakes before
            they pollute reporting.
          </p>
        </div>
        <div className="utm-hero__score" aria-label={`Quality score ${qualityScore}`}>
          <span>{qualityScore}</span>
          <small>quality score</small>
        </div>
      </header>

      <main className="utm-workspace">
        <section className="panel utm-form-panel">
          <div className="panel__header panel__header--stacked">
            <div>
              <span className="eyebrow">Inputs</span>
              <h2>Campaign setup</h2>
              <p>Required fields are checked instantly. Optional fields stay out of the URL when empty.</p>
            </div>
          </div>

          <div className="utm-form">
            <UtmField
              assist="Use the final landing page, not a short link."
              error={validation.errors.url}
              label="Destination URL"
              name="url"
              onBlur={normalizeInput}
              onChange={updateInput}
              placeholder="https://example.com/landing-page"
              value={inputs.url}
            />

            <div className="utm-field-group">
              <UtmField
                assist="Where the click comes from."
                error={validation.errors.source}
                label="utm_source"
                name="source"
                onBlur={normalizeInput}
                onChange={updateInput}
                placeholder="newsletter"
                value={inputs.source}
              />
              <div className="utm-presets" aria-label="Source presets">
                {sourcePresets.map((preset) => (
                  <button
                    className={inputs.source === preset ? "utm-chip utm-chip--active" : "utm-chip"}
                    key={preset}
                    onClick={() => applyPreset("source", preset)}
                    type="button"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="utm-field-group">
              <UtmField
                assist="The traffic type or channel."
                error={validation.errors.medium}
                label="utm_medium"
                name="medium"
                onBlur={normalizeInput}
                onChange={updateInput}
                placeholder="email"
                value={inputs.medium}
              />
              <div className="utm-presets" aria-label="Medium presets">
                {mediumPresets.map((preset) => (
                  <button
                    className={inputs.medium === preset ? "utm-chip utm-chip--active" : "utm-chip"}
                    key={preset}
                    onClick={() => applyPreset("medium", preset)}
                    type="button"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <UtmField
              assist="Use one stable campaign name across assets."
              error={validation.errors.campaign}
              label="utm_campaign"
              name="campaign"
              onBlur={normalizeInput}
              onChange={updateInput}
              placeholder="spring_launch"
              value={inputs.campaign}
            />

            <div className="utm-form__split">
              <UtmField
                assist="Optional: keyword or audience."
                label="utm_term"
                name="term"
                onBlur={normalizeInput}
                onChange={updateInput}
                placeholder="brand_keyword"
                value={inputs.term}
              />
              <UtmField
                assist="Optional: creative, button, or placement."
                label="utm_content"
                name="content"
                onBlur={normalizeInput}
                onChange={updateInput}
                placeholder="hero_button"
                value={inputs.content}
              />
            </div>
          </div>
        </section>

        <section className="utm-output-stack">
          <section className="panel utm-result-panel">
            <div className="panel__header">
              <div>
                <span className="eyebrow">Result</span>
                <h2>Ready-to-use URL</h2>
                <p>{validation.isValid ? "Everything required is in place." : "The link will appear after required fields are valid."}</p>
              </div>
            </div>

            <div className="utm-url-preview" aria-live="polite">
              {generatedUrl && validation.isValid ? generatedUrl : "Waiting for a valid destination and required UTM fields."}
            </div>

            <div className="utm-actions">
              <button className="hero-button hero-button--primary hero-action" onClick={handleCopyUrl} type="button">
                Copy URL
              </button>
              <button className="ghost-button hero-action" onClick={handleCopyParams} type="button">
                Copy parameters
              </button>
              <button
                className="ghost-button hero-action"
                onClick={() => {
                  setInputs(defaultUtmInputs);
                  setFeedback("Reset to example");
                }}
                type="button"
              >
                Reset
              </button>
            </div>

            <span className={`hero-feedback${feedback ? " hero-feedback--visible" : ""}`}>
              {feedback ?? "Copy the full link or just the query string."}
            </span>
          </section>

          <section className="panel utm-quality-panel">
            <div className="panel__header panel__header--stacked">
              <div>
                <span className="eyebrow">Quality check</span>
                <h2>Data hygiene guardrails</h2>
              </div>
            </div>

            <div className="utm-check-list">
              <div className={validation.errors.url ? "utm-check utm-check--bad" : "utm-check"}>
                <span>Destination URL</span>
                <strong>{validation.errors.url ? "Needs fix" : "Valid"}</strong>
              </div>
              <div className={validation.isValid ? "utm-check" : "utm-check utm-check--bad"}>
                <span>Required UTM fields</span>
                <strong>{validation.isValid ? "Complete" : "Incomplete"}</strong>
              </div>
              <div className={validation.warnings.length ? "utm-check utm-check--warn" : "utm-check"}>
                <span>Naming consistency</span>
                <strong>{validation.warnings.length ? `${validation.warnings.length} warning${validation.warnings.length > 1 ? "s" : ""}` : "Clean"}</strong>
              </div>
            </div>

            {validation.warnings.length > 0 ? (
              <ul className="utm-warning-list">
                {validation.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : (
              <p className="utm-quality-panel__clean">
                Lowercase values, URL-safe characters, and no duplicate UTM noise detected.
              </p>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
