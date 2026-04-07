import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { useLocation } from "react-router-dom";
import { SnapshotCard } from "../components/SnapshotCard";
import { ControlPanel } from "../components/ControlPanel";
import { MetricsGrid } from "../components/MetricsGrid";
import { ComparisonBars } from "../components/ComparisonBars";
import { HowItWorks } from "../components/HowItWorks";
import { InsightBlock } from "../components/InsightBlock";
import {
  clampMoneyInputsForCurrency,
  resetMoneyInputsForCurrency,
} from "../lib/currencyPresets";
import { analyticsGoals, trackGoal } from "../lib/analytics";
import { defaultInputs } from "../data/defaultInputs";
import { createFormatters, type CurrencyCode } from "../lib/format";
import { applyMetadata } from "../lib/metadata";
import { generateSnapshotMessaging } from "../lib/snapshotMessaging";
import { normalizeInputs, runSimulation, type SimulationInputs } from "../lib/simulation";
import {
  clearScenarioUrl,
  getCanonicalScenarioUrl,
  isDefaultScenarioState,
  readScenarioFromUrl,
  TOOL_PATH,
  writeScenarioToUrl,
} from "../lib/urlState";

const defaultCurrency: CurrencyCode = "USD";

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

const makeDownload = (href: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  link.click();
};

export function RetargetingPage() {
  const location = useLocation();
  const initialState = useMemo(
    () => readScenarioFromUrl(defaultInputs, defaultCurrency),
    [],
  );
  const [inputs, setInputs] = useState<SimulationInputs>(initialState.inputs);
  const [currency, setCurrency] = useState<CurrencyCode>(initialState.currency);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isExportingSnapshot, setIsExportingSnapshot] = useState(false);
  const exportSnapshotRef = useRef<HTMLDivElement>(null);
  const hasHydratedFromUrlRef = useRef(initialState.hasQueryParams);
  const hasTrackedScenarioAdjustedRef = useRef(false);

  const currencySafeInputs = clampMoneyInputsForCurrency(inputs, currency);
  const normalizedInputs = normalizeInputs(currencySafeInputs);
  const outputs = runSimulation(normalizedInputs);
  const formatters = useMemo(() => createFormatters(currency), [currency]);
  const insight = useMemo(
    () => generateSnapshotMessaging({ outputs, formatters }),
    [formatters, outputs],
  );

  useEffect(() => {
    applyMetadata({
      title: "Retargeting Simulation — Incrementality Lab",
      description:
        "Interactive simulation of how retargeting attribution can diverge from incremental performance.",
      url: "https://lab.mzhirnov.com/retargeting",
    });
  }, []);

  useEffect(() => {
    const isDefaultState = isDefaultScenarioState(
      normalizedInputs,
      currency,
      defaultInputs,
      defaultCurrency,
    );

    if (!hasHydratedFromUrlRef.current && isDefaultState) {
      return;
    }

    if (isDefaultState) {
      clearScenarioUrl(TOOL_PATH);
      return;
    }

    hasHydratedFromUrlRef.current = true;
    writeScenarioToUrl(normalizedInputs, currency);
  }, [currency, normalizedInputs]);

  useEffect(() => {
    if (!actionFeedback) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setActionFeedback(null);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [actionFeedback]);

  useEffect(() => {
    if (initialState.hasQueryParams) {
      trackGoal(analyticsGoals.sharedScenarioOpened);
    }
  }, [initialState.hasQueryParams]);

  useEffect(() => {
    if (location.search) {
      hasHydratedFromUrlRef.current = true;
    }
  }, [location.search]);

  const handleCopyShareLink = async () => {
    try {
      await copyText(getCanonicalScenarioUrl(normalizedInputs, currency));
      trackGoal(analyticsGoals.shareLinkCopied);
      setActionFeedback("Link copied ✓");
    } catch {
      setActionFeedback("Could not copy share link");
    }
  };

  const handleCopyInsightText = async () => {
    try {
      await copyText(insight.textExport);
      trackGoal(analyticsGoals.insightTextCopied);
      setActionFeedback("Copied ✓");
    } catch {
      setActionFeedback("Could not copy insight text");
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

      makeDownload(dataUrl, "incrementality-lab-snapshot.png");
      trackGoal(analyticsGoals.snapshotDownloaded);
      setActionFeedback("Snapshot downloaded ✓");
    } catch {
      setActionFeedback("Could not export snapshot");
    } finally {
      setIsExportingSnapshot(false);
    }
  };

  const handleCurrencyChange = (nextCurrency: CurrencyCode) => {
    trackGoal(analyticsGoals.currencyChanged, { currency: nextCurrency });
    setCurrency(nextCurrency);
    setInputs((currentInputs) =>
      resetMoneyInputsForCurrency(currentInputs, nextCurrency),
    );
  };

  const handleInputsChange = (nextInputs: SimulationInputs) => {
    if (!hasTrackedScenarioAdjustedRef.current) {
      trackGoal(analyticsGoals.scenarioAdjusted);
      hasTrackedScenarioAdjustedRef.current = true;
    }

    setInputs(nextInputs);
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__copy">
          <h1>{insight.ui.headline}</h1>
          <p>
            Adjust inputs to explore the gap between reported and real
            performance.
          </p>
        </div>
        <div className="hero__side">
          <div className="hero__actions">
            <button
              className="ghost-button hero-action"
              onClick={handleCopyInsightText}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="button-icon"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M7.5 6.667h6.25A1.25 1.25 0 0 1 15 7.917v7.5a1.25 1.25 0 0 1-1.25 1.25H7.5a1.25 1.25 0 0 1-1.25-1.25v-7.5A1.25 1.25 0 0 1 7.5 6.667Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
                <path
                  d="M5.833 13.333h-.416a1.25 1.25 0 0 1-1.25-1.25V4.583a1.25 1.25 0 0 1 1.25-1.25h6.25a1.25 1.25 0 0 1 1.25 1.25V5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
              Copy insight
            </button>
            <button
              className="ghost-button hero-action"
              onClick={handleCopyShareLink}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="button-icon"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M8.333 11.667 11.667 8.333"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
                <path
                  d="M6.25 13.75 5 15a2.357 2.357 0 1 1-3.333-3.333l2.083-2.084A2.357 2.357 0 0 1 7.083 12.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
                <path
                  d="m13.75 6.25 1.25-1.25a2.357 2.357 0 1 1 3.333 3.333L16.25 10.417A2.357 2.357 0 0 1 12.917 7.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
              Copy link
            </button>
            <button
              className="hero-button hero-button--primary hero-action"
              disabled={isExportingSnapshot}
              onClick={handleDownloadSnapshot}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="button-icon"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M10 3.75v8.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
                <path
                  d="M6.667 9.583 10 12.917l3.333-3.334"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
                <path
                  d="M4.167 15.417h11.666"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
              </svg>
              {isExportingSnapshot ? "Preparing PNG..." : "Download snapshot"}
            </button>
          </div>
          <span className={`hero-feedback${actionFeedback ? " hero-feedback--visible" : ""}`}>
            {actionFeedback ?? "Copy a shareable scenario or export a slide-ready snapshot."}
          </span>
        </div>
      </header>

      <main className="dashboard">
        <ControlPanel
          currency={currency}
          formatCurrency={formatters.currency}
          inputs={normalizedInputs}
          onChange={handleInputsChange}
          onCurrencyChange={handleCurrencyChange}
          onReset={() => {
            trackGoal(analyticsGoals.defaultsReset);
            setInputs(defaultInputs);
            setCurrency(defaultCurrency);
            hasHydratedFromUrlRef.current = false;
            clearScenarioUrl(TOOL_PATH);
          }}
        />

        <section className="content-column">
          <section className="panel snapshot-panel">
            <div className="panel__header">
              <div>
                <span className="eyebrow">Presentation snapshot</span>
                <h3>Export-ready insight card</h3>
                <p>Built for screenshots, decks and quick social sharing.</p>
              </div>
            </div>
            <SnapshotCard
              formatters={formatters}
              insight={insight}
              isDownloading={isExportingSnapshot}
              onDownload={handleDownloadSnapshot}
              outputs={outputs}
            />
          </section>

          <MetricsGrid formatters={formatters} outputs={outputs} />

          <div className="chart-grid">
            <ComparisonBars
              title="Attributed vs incremental conversions"
              subtitle="Attributed conversions include exposed users who would have converted anyway."
              items={[
                {
                  label: "Reported / attributed conversions",
                  value: outputs.attributedConversions,
                  colorClass: "bar-fill--teal",
                  valueLabel: formatters.count(outputs.attributedConversions),
                },
                {
                  label: "Incremental conversions",
                  value: outputs.incrementalConversions,
                  colorClass: "bar-fill--gold",
                  valueLabel: formatters.count(outputs.incrementalConversions),
                },
              ]}
            />

            <ComparisonBars
              title="Attributed ROAS vs incremental ROAS"
              subtitle="The same campaign can look efficient in reporting but weak on true lift."
              items={[
                {
                  label: "Reported / attributed ROAS",
                  value: outputs.attributedROAS,
                  colorClass: "bar-fill--teal",
                  valueLabel: formatters.roas(outputs.attributedROAS),
                },
                {
                  label: "Incremental ROAS",
                  value: outputs.incrementalROAS,
                  colorClass: "bar-fill--gold",
                  valueLabel: formatters.roas(outputs.incrementalROAS),
                },
              ]}
            />
          </div>

          <InsightBlock
            gapHighlight={insight.ui.gapLine}
            headline={insight.ui.headline}
            moneyLine={insight.ui.moneyLine}
            supportingLine={insight.ui.supportingLine}
          />

          <HowItWorks />
        </section>
      </main>

      <div className="snapshot-export-root" aria-hidden="true">
        <div ref={exportSnapshotRef}>
          <SnapshotCard
            exportMode
            formatters={formatters}
            insight={insight}
            outputs={outputs}
          />
        </div>
      </div>
    </div>
  );
}
