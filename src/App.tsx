import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { SnapshotCard } from "./components/SnapshotCard";
import { ControlPanel } from "./components/ControlPanel";
import { MetricsGrid } from "./components/MetricsGrid";
import { ComparisonBars } from "./components/ComparisonBars";
import { HowItWorks } from "./components/HowItWorks";
import { InsightBlock } from "./components/InsightBlock";
import {
  clampMoneyInputsForCurrency,
  resetMoneyInputsForCurrency,
} from "./lib/currencyPresets";
import { defaultInputs } from "./data/defaultInputs";
import { createFormatters, type CurrencyCode } from "./lib/format";
import { generateSnapshotMessaging } from "./lib/snapshotMessaging";
import { normalizeInputs, runSimulation, type SimulationInputs } from "./lib/simulation";
import { readScenarioFromUrl, writeScenarioToUrl } from "./lib/urlState";

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

function App() {
  const initialState = useMemo(
    () => readScenarioFromUrl(defaultInputs, defaultCurrency),
    [],
  );
  const [inputs, setInputs] = useState<SimulationInputs>(initialState.inputs);
  const [currency, setCurrency] = useState<CurrencyCode>(initialState.currency);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isExportingSnapshot, setIsExportingSnapshot] = useState(false);
  const exportSnapshotRef = useRef<HTMLDivElement>(null);

  const currencySafeInputs = clampMoneyInputsForCurrency(inputs, currency);
  const normalizedInputs = normalizeInputs(currencySafeInputs);
  const outputs = runSimulation(normalizedInputs);
  const formatters = useMemo(() => createFormatters(currency), [currency]);
  const insight = useMemo(
    () => generateSnapshotMessaging({ outputs, formatters }),
    [formatters, outputs],
  );

  useEffect(() => {
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

  const handleCopyShareLink = async () => {
    try {
      await copyText(window.location.href);
      setActionFeedback("Share link copied");
    } catch {
      setActionFeedback("Could not copy share link");
    }
  };

  const handleCopyInsightText = async () => {
    try {
      await copyText(insight.textExport);
      setActionFeedback("Insight text copied");
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
      setActionFeedback("Snapshot PNG downloaded");
    } catch {
      setActionFeedback("Could not export snapshot");
    } finally {
      setIsExportingSnapshot(false);
    }
  };

  const handleCurrencyChange = (nextCurrency: CurrencyCode) => {
    setCurrency(nextCurrency);
    setInputs((currentInputs) =>
      resetMoneyInputsForCurrency(currentInputs, nextCurrency),
    );
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__copy">
          <span className="eyebrow">Incrementality Lab</span>
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
              Copy insight text
            </button>
            <button
              className="ghost-button hero-action"
              onClick={handleCopyShareLink}
              type="button"
            >
              Copy share link
            </button>
            <button
              className="hero-button hero-button--primary hero-action"
              disabled={isExportingSnapshot}
              onClick={handleDownloadSnapshot}
              type="button"
            >
              {isExportingSnapshot ? "Preparing PNG..." : "Download snapshot"}
            </button>
          </div>
          <span className={`feedback-pill${actionFeedback ? " feedback-pill--visible" : ""}`}>
            {actionFeedback ?? "Share or export the current scenario"}
          </span>
        </div>
      </header>

      <main className="dashboard">
        <ControlPanel
          currency={currency}
          formatCurrency={formatters.currency}
          inputs={normalizedInputs}
          onChange={setInputs}
          onCurrencyChange={handleCurrencyChange}
          onReset={() => {
            setInputs(defaultInputs);
            setCurrency(defaultCurrency);
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

export default App;
