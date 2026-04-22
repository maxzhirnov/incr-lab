import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { toPng } from "html-to-image";
import { useLocation } from "react-router-dom";
import { analyticsGoals, trackGoal } from "../lib/analytics";
import { applyMetadata } from "../lib/metadata";
import {
  defaultReadinessInputs,
  evaluateReadiness,
  formatReadinessReport,
  getCanonicalReadinessUrl,
  frameworkDimensions,
  isDefaultReadinessState,
  readReadinessFromUrl,
  readinessQuestions,
  writeReadinessToUrl,
  type ReadinessInputs,
  type ReadinessLevel,
} from "../lib/readinessScore";
import { clearScenarioUrl } from "../lib/urlState";
import { READINESS_SCORE_PATH } from "../lib/readinessScore";

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

const maturityReads: Record<ReadinessLevel, string> = {
  "Attribution-dependent":
    "Do not use attribution reports as budget truth yet. The team needs measurement foundations before a major causal claim.",
  "Needs foundations":
    "A first readout is possible, but trust will break unless the weakest foundation is repaired first.",
  "Experiment-ready":
    "The team can run a credible focused test if the causal question and decision rule are locked before launch.",
  "Ready to scale":
    "The team is ready to manage incrementality as a repeatable planning system across channels.",
};

const sections = Array.from(
  new Set(readinessQuestions.map((question) => question.section)),
);

type NumberFieldProps = {
  label: string;
  min: number;
  name: keyof Omit<ReadinessInputs, "answers">;
  onChange: (name: keyof Omit<ReadinessInputs, "answers">, value: number) => void;
  step?: number;
  suffix?: string;
  value: number;
};

function NumberField({
  label,
  min,
  name,
  onChange,
  step = 1,
  suffix,
  value,
}: NumberFieldProps) {
  return (
    <label className="readiness-number-field">
      <span>{label}</span>
      <div className="readiness-number-field__input">
        <input
          min={min}
          onChange={(event) => onChange(name, Number(event.target.value))}
          step={step}
          type="number"
          value={value}
        />
        {suffix ? <small>{suffix}</small> : null}
      </div>
    </label>
  );
}

export function ReadinessScorePage() {
  const location = useLocation();
  const initialState = useMemo(() => readReadinessFromUrl(), []);
  const [inputs, setInputs] = useState<ReadinessInputs>(initialState.inputs);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hasTrackedEdit, setHasTrackedEdit] = useState(false);
  const [isExportingSnapshot, setIsExportingSnapshot] = useState(false);
  const hasHydratedFromUrlRef = useRef(initialState.hasQueryParams);
  const exportSnapshotRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => evaluateReadiness(inputs), [inputs]);
  const reportText = useMemo(() => formatReadinessReport(inputs), [inputs]);

  useEffect(() => {
    applyMetadata({
      title: "Incrementality Readiness Score — Incrementality Lab",
      description:
        "Diagnose whether a marketing team is ready to make causal budget decisions with incrementality measurement.",
      url: "https://lab.mzhirnov.com/incrementality-readiness",
      image: "https://lab.mzhirnov.com/og/incrementality-readiness.png",
    });
  }, []);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    if (!hasHydratedFromUrlRef.current && isDefaultReadinessState(inputs)) {
      return;
    }

    if (isDefaultReadinessState(inputs)) {
      clearScenarioUrl(READINESS_SCORE_PATH);
      return;
    }

    hasHydratedFromUrlRef.current = true;
    writeReadinessToUrl(inputs);
  }, [inputs]);

  useEffect(() => {
    if (location.search) {
      hasHydratedFromUrlRef.current = true;
    }
  }, [location.search]);

  const trackEdit = () => {
    if (!hasTrackedEdit) {
      trackGoal(analyticsGoals.readinessScoreAdjusted);
      setHasTrackedEdit(true);
    }
  };

  const updateNumberInput = (
    name: keyof Omit<ReadinessInputs, "answers">,
    value: number,
  ) => {
    trackEdit();
    setInputs((currentInputs) => ({
      ...currentInputs,
      [name]: Math.max(0, value),
    }));
  };

  const updateAnswer = (questionId: string, optionId: string) => {
    trackEdit();
    setInputs((currentInputs) => ({
      ...currentInputs,
      answers: {
        ...currentInputs.answers,
        [questionId]: optionId,
      },
    }));
  };

  const handleCopyReport = async () => {
    try {
      await copyText(reportText);
      trackGoal(analyticsGoals.readinessReportCopied);
      setFeedback("Audit report copied");
    } catch {
      setFeedback("Could not copy report");
    }
  };

  const handleCopyShareLink = async () => {
    try {
      await copyText(getCanonicalReadinessUrl(inputs));
      trackGoal(analyticsGoals.readinessShareLinkCopied);
      setFeedback("Share link copied");
    } catch {
      setFeedback("Could not copy link");
    }
  };

  const handleDownloadSnapshot = async () => {
    if (!exportSnapshotRef.current) {
      return;
    }

    setIsExportingSnapshot(true);

    try {
      const rect = exportSnapshotRef.current.getBoundingClientRect();
      const dataUrl = await toPng(exportSnapshotRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#f6f1e5",
        width: rect.width,
        height: rect.height,
        canvasWidth: rect.width * 2,
        canvasHeight: rect.height * 2,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "incrementality-readiness-audit.png";
      link.click();
      trackGoal(analyticsGoals.readinessSnapshotDownloaded);
      setFeedback("Snapshot downloaded");
    } catch {
      setFeedback("Could not export snapshot");
    } finally {
      setIsExportingSnapshot(false);
    }
  };

  const snapshot = (
    <article className="readiness-snapshot-card">
      <span className="eyebrow">Incrementality Lab</span>
      <h2>{result.level}</h2>
      <strong>{result.score}/100</strong>
      <p>{result.primaryRecommendation}</p>
      <div className="readiness-snapshot-card__grid">
        <span>Blocker: {result.blocker.label}</span>
        <span>Design: {result.recommendedDesign.name}</span>
      </div>
      <footer>Incrementality Readiness Audit • lab.mzhirnov.com</footer>
    </article>
  );

  return (
    <div className="readiness-shell">
      <header className="readiness-hero">
        <div className="readiness-hero__copy">
          <span className="eyebrow">Incrementality Readiness Score</span>
          <h1>A guided audit for causal marketing decisions</h1>
          <p>
            Answer concrete operating questions. The framework turns them into
            a readiness score, blocker diagnosis, and first measurement path.
          </p>
        </div>
        <div className="readiness-score-card" aria-label={`Readiness score ${result.score}`}>
          <span className="readiness-score-card__label">Readiness</span>
          <strong>{result.score}</strong>
          <span className="readiness-score-card__level">{result.level}</span>
        </div>
      </header>

      <main className="readiness-workspace">
        <section className="panel readiness-input-panel">
          <div className="panel__header panel__header--stacked">
            <div>
              <span className="eyebrow">Guided audit</span>
              <h2>Answer what is true today</h2>
                <p>
                  The options are intentionally specific, so the score has an
                evidence trail instead of subjective maturity ratings.
                </p>
            </div>
          </div>

          <div className="readiness-input-grid">
            <NumberField
              label="Monthly conversions"
              min={0}
              name="monthlyConversions"
              onChange={updateNumberInput}
              step={50}
              value={inputs.monthlyConversions}
            />
            <NumberField
              label="Monthly media spend"
              min={0}
              name="monthlySpend"
              onChange={updateNumberInput}
              step={1000}
              suffix="$"
              value={inputs.monthlySpend}
            />
            <NumberField
              label="Active paid channels"
              min={1}
              name="channels"
              onChange={updateNumberInput}
              value={inputs.channels}
            />
          </div>

          <div className="readiness-question-list">
            {sections.map((section) => (
              <section className="readiness-question-section" key={section}>
                <h3>{section}</h3>
                {readinessQuestions
                  .filter((question) => question.section === section)
                  .map((question) => (
                    <article className="readiness-question" key={question.id}>
                      <div className="readiness-question__header">
                        <h4>{question.question}</h4>
                        <p>{question.why}</p>
                      </div>
                      <div className="readiness-option-grid">
                        {question.options.map((option) => {
                          const isSelected =
                            inputs.answers[question.id] === option.id;

                          return (
                            <button
                              className={
                                isSelected
                                  ? "readiness-option readiness-option--selected"
                                  : "readiness-option"
                              }
                              key={option.id}
                              onClick={() => updateAnswer(question.id, option.id)}
                              type="button"
                            >
                              <span>{option.label}</span>
                              <small>{option.evidence}</small>
                            </button>
                          );
                        })}
                      </div>
                    </article>
                  ))}
              </section>
            ))}
          </div>
        </section>

        <section className="readiness-output-stack">
          <section className="panel readiness-result-panel">
            <div className="panel__header panel__header--stacked">
              <div>
                <span className="eyebrow">Audit readout</span>
                <h2>{result.level}</h2>
                <p>{maturityReads[result.level]}</p>
              </div>
            </div>

            <div className="readiness-meter" style={{ "--score": result.score } as CSSProperties}>
              <div className="readiness-meter__track">
                <span className="readiness-meter__fill" />
              </div>
              <div className="readiness-meter__labels">
                <span>Attribution</span>
                <span>Experiment-ready</span>
                <span>Scaled system</span>
              </div>
            </div>

            <div className="readiness-blocker-card">
              <span>Primary blocker</span>
              <strong>{result.blocker.label}</strong>
              <p>{result.blocker.read}</p>
            </div>

            <div className="readiness-test-design-card">
              <span>Recommended test design</span>
              <strong>{result.recommendedDesign.name}</strong>
              <p>{result.recommendedDesign.fit}</p>
              <small>{result.recommendedDesign.caution}</small>
            </div>

            <div className="readiness-board-memo">
              <span>Board-ready memo</span>
              <strong>{result.boardMemo.headline}</strong>
              <p>{result.boardMemo.body}</p>
              <small>{result.boardMemo.ask}</small>
            </div>

            <div className="readiness-client-report">
              <span>Client-ready report</span>
              {result.clientReadyReport.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>

            <div className="readiness-decision-grid">
              <article>
                <span>Can test now</span>
                <p>{result.canTestNow}</p>
              </article>
              <article>
                <span>Not yet</span>
                <p>{result.notYet}</p>
              </article>
            </div>

            <div className="readiness-actions">
              <button
                className="hero-button hero-button--primary hero-action"
                onClick={handleCopyReport}
                type="button"
              >
                Copy audit report
              </button>
              <button
                className="ghost-button hero-action"
                onClick={handleCopyShareLink}
                type="button"
              >
                Copy link
              </button>
              <button
                className="ghost-button hero-action"
                disabled={isExportingSnapshot}
                onClick={handleDownloadSnapshot}
                type="button"
              >
                {isExportingSnapshot ? "Preparing..." : "Download PNG"}
              </button>
              <button
                className="ghost-button hero-action"
                onClick={() => {
                  setInputs(defaultReadinessInputs);
                  hasHydratedFromUrlRef.current = false;
                  clearScenarioUrl(READINESS_SCORE_PATH);
                  setFeedback("Reset to example");
                }}
                type="button"
              >
                Reset
              </button>
            </div>
            <span className={`hero-feedback${feedback ? " hero-feedback--visible" : ""}`}>
              {feedback ?? "Copy a strategy-ready audit summary."}
            </span>
          </section>

          <section className="panel readiness-roadmap-panel">
            <div className="panel__header panel__header--stacked">
              <div>
                <span className="eyebrow">30-day path</span>
                <h2>Next best actions</h2>
              </div>
            </div>

            <div className="readiness-roadmap">
              {result.roadmap.map((item, index) => (
                <article key={item}>
                  <span>{index + 1}</span>
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel readiness-benchmark-panel">
            <div className="panel__header panel__header--stacked">
              <div>
                <span className="eyebrow">Benchmark language</span>
                <h2>How to frame this maturity level</h2>
                <p>{result.benchmark.peers}</p>
              </div>
            </div>
            <div className="readiness-decision-grid">
              <article>
                <span>Usually can</span>
                <p>{result.benchmark.usuallyCan}</p>
              </article>
              <article>
                <span>Usually cannot</span>
                <p>{result.benchmark.usuallyCannot}</p>
              </article>
            </div>
          </section>

          <section className="panel readiness-risk-panel">
            <div className="panel__header panel__header--stacked">
              <div>
                <span className="eyebrow">Diagnostic map</span>
                <h2>Five readiness dimensions</h2>
              </div>
            </div>

            <div className="readiness-map-grid">
              {result.dimensionScores.map((dimension) => (
                <article key={dimension.key}>
                  <header>
                    <span>{dimension.label}</span>
                    <strong>{dimension.score}</strong>
                  </header>
                  <div className="readiness-map-grid__track">
                    <span style={{ width: `${dimension.score}%` }} />
                  </div>
                  <p>{dimension.read}</p>
                  <small>{dimension.status}</small>
                </article>
              ))}
            </div>

            <div className="readiness-evidence-list">
              <strong>Evidence requiring attention</strong>
              {result.evidence
                .filter((item) => item.option.score < 70)
                .slice(0, 4)
                .map((item) => (
                  <p key={item.question.id}>{item.option.evidence}</p>
                ))}
            </div>
          </section>

          <section className="panel readiness-methodology-panel">
            <div className="panel__header panel__header--stacked">
              <div>
                <span className="eyebrow">Methodology</span>
                <h2>How the framework scores readiness</h2>
                <p>
                  The score combines five dimensions: data foundation,
                  experiment design, decision discipline, signal volume, and
                  organizational alignment. The lowest dimension becomes the
                  primary blocker because trust usually fails at the weakest
                  operating point.
                </p>
              </div>
            </div>
            <div className="readiness-methodology-grid">
              {frameworkDimensions.map((dimension) => (
                <article key={dimension.key}>
                  <strong>{dimension.title}</strong>
                  <p>{dimension.principle}</p>
                </article>
              ))}
            </div>
            <div className="readiness-methodology-grid readiness-methodology-grid--compact">
              <article>
                <strong>Evidence-based inputs</strong>
                <p>Answers are concrete operating states, not subjective maturity ratings.</p>
              </article>
              <article>
                <strong>Blocker-first readout</strong>
                <p>The recommendation focuses on the constraint most likely to invalidate the result.</p>
              </article>
              <article>
                <strong>Design fit</strong>
                <p>The suggested test design changes with signal, control-group feasibility, and organizational readiness.</p>
              </article>
            </div>
          </section>

          <section className="panel readiness-article-panel">
            <div className="panel__header panel__header--stacked">
              <div>
                <span className="eyebrow">Framework note</span>
                <h2>Why readiness comes before incrementality testing</h2>
                <p>
                  Incrementality testing is often treated as a statistical
                  problem, but most failed readouts fail operationally first.
                  If teams disagree on the source of truth, cannot create a
                  credible control group, or wait until after results arrive to
                  decide what action they will take, the analysis becomes a
                  negotiation instead of evidence.
                </p>
              </div>
            </div>
            <div className="readiness-article-grid">
              <article>
                <strong>Readiness is not sophistication</strong>
                <p>
                  A simple holdout with clean ownership is more valuable than a
                  complex design nobody trusts.
                </p>
              </article>
              <article>
                <strong>The blocker defines the roadmap</strong>
                <p>
                  The weakest dimension should be repaired before expanding the
                  test scope or using the result for larger budget decisions.
                </p>
              </article>
            </div>
          </section>
        </section>
      </main>

      <div className="snapshot-export-root" aria-hidden="true">
        <div ref={exportSnapshotRef}>{snapshot}</div>
      </div>
    </div>
  );
}
