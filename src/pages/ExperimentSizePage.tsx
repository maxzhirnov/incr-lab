import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { useLocation } from "react-router-dom";
import { analyticsGoals, trackGoal } from "../lib/analytics";
import { applyMetadata } from "../lib/metadata";
import {
  defaultExperimentSizeInputs,
  normalizeExperimentSizeInputs,
  runExperimentSizeCalculation,
  type ExperimentSizeInputs,
} from "../lib/experimentSize";
import {
  EXPERIMENT_SIZE_TOOL_PATH,
  getCanonicalExperimentSizeUrl,
  isDefaultExperimentSizeState,
  readExperimentSizeFromUrl,
  writeExperimentSizeToUrl,
} from "../lib/experimentSizeUrlState";
import { ExperimentSizeControlPanel } from "../components/ExperimentSizeControlPanel";
import { ExperimentSizeSnapshotCard } from "../components/ExperimentSizeSnapshotCard";
import { ExperimentFaq } from "../components/ExperimentFaq";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { clearScenarioUrl } from "../lib/urlState";

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

const formatPercent = (value: number, digits = 1) =>
  `${(value * 100).toFixed(digits)}%`;

export function ExperimentSizePage() {
  const location = useLocation();
  const initialState = useMemo(() => readExperimentSizeFromUrl(), []);
  const [inputs, setInputs] = useState<ExperimentSizeInputs>(initialState.inputs);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isExportingSnapshot, setIsExportingSnapshot] = useState(false);
  const exportSnapshotRef = useRef<HTMLDivElement>(null);
  const hasHydratedFromUrlRef = useRef(initialState.hasQueryParams);
  const hasTrackedScenarioAdjustedRef = useRef(false);

  const normalizedInputs = normalizeExperimentSizeInputs(inputs);
  const outputs = useMemo(
    () => runExperimentSizeCalculation(normalizedInputs),
    [normalizedInputs],
  );

  useEffect(() => {
    applyMetadata({
      title: "Experiment Size Calculator — Incrementality Lab",
      description:
        "Estimate sample size, MDE, duration, and feasibility for product and marketing experiments.",
      url: "https://lab.mzhirnov.com/experiment-size",
      image: "https://lab.mzhirnov.com/og/experiment-size.png",
    });
  }, []);

  useEffect(() => {
    if (
      !hasHydratedFromUrlRef.current &&
      isDefaultExperimentSizeState(normalizedInputs)
    ) {
      return;
    }

    if (isDefaultExperimentSizeState(normalizedInputs)) {
      clearScenarioUrl(EXPERIMENT_SIZE_TOOL_PATH);
      return;
    }

    hasHydratedFromUrlRef.current = true;
    writeExperimentSizeToUrl(normalizedInputs);
  }, [normalizedInputs]);

  useEffect(() => {
    if (!actionFeedback) {
      return;
    }

    const timeout = window.setTimeout(() => setActionFeedback(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [actionFeedback]);

  useEffect(() => {
    if (location.search) {
      hasHydratedFromUrlRef.current = true;
    }
  }, [location.search]);

  const handleInputsChange = (nextInputs: ExperimentSizeInputs) => {
    if (!hasTrackedScenarioAdjustedRef.current) {
      trackGoal(analyticsGoals.experimentSizeScenarioAdjusted);
      hasTrackedScenarioAdjustedRef.current = true;
    }

    setInputs(normalizeExperimentSizeInputs(nextInputs));
  };

  const handleCopyShareLink = async () => {
    try {
      await copyText(getCanonicalExperimentSizeUrl(normalizedInputs));
      trackGoal(analyticsGoals.experimentSizeShareLinkCopied);
      setActionFeedback("Link copied ✓");
    } catch {
      setActionFeedback("Could not copy share link");
    }
  };

  const handleCopyInsightText = async () => {
    const text = [
      "Experiment size calculator",
      "",
      `Baseline conversion rate: ${formatPercent(outputs.baselineRate)}`,
      `MDE: ${formatPercent(outputs.relativeMde)}`,
      `Significance: ${formatPercent(outputs.significance, 0)}`,
      `Power: ${formatPercent(outputs.power, 0)}`,
      `Groups: ${outputs.groups}`,
      "",
      `Sample size per group: ${outputs.sampleSizePerGroup.toLocaleString("en-US")}`,
      `Total sample size: ${outputs.totalSampleSize.toLocaleString("en-US")}`,
      `Absolute detectable lift: ${formatPercent(outputs.baselineRate)} → ${formatPercent(outputs.targetRate)}`,
      `Estimated duration: ${
        outputs.estimatedDurationDays
          ? `${Math.ceil(outputs.estimatedDurationDays)} days`
          : "Traffic not provided"
      }`,
      "",
      outputs.keyInsight,
    ].join("\n");

    try {
      await copyText(text);
      trackGoal(analyticsGoals.experimentSizeInsightCopied);
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

      makeDownload(dataUrl, "incrementality-lab-experiment-size.png");
      trackGoal(analyticsGoals.experimentSizeSnapshotDownloaded);
      setActionFeedback("Snapshot downloaded ✓");
    } catch {
      setActionFeedback("Could not export snapshot");
    } finally {
      setIsExportingSnapshot(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__copy">
          <span className="eyebrow">Experiment Size Calculator</span>
          <h1>Estimate sample size, MDE, and test feasibility</h1>
          <p>
            Plan experiments around traffic reality, not just statistical theory.
          </p>
        </div>
        <div className="hero__side">
          <div className="hero__actions">
            <button
              className="ghost-button hero-action"
              onClick={handleCopyInsightText}
              type="button"
            >
              Copy insight
            </button>
            <button
              className="ghost-button hero-action"
              onClick={handleCopyShareLink}
              type="button"
            >
              Copy link
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
          <span className={`hero-feedback${actionFeedback ? " hero-feedback--visible" : ""}`}>
            {actionFeedback ?? "Share the scenario or export a slide-ready planning snapshot."}
          </span>
        </div>
      </header>

      <main className="dashboard">
        <ExperimentSizeControlPanel
          inputs={normalizedInputs}
          onChange={handleInputsChange}
          onReset={() => {
            trackGoal(analyticsGoals.defaultsReset);
            setInputs(defaultExperimentSizeInputs);
            hasHydratedFromUrlRef.current = false;
            clearScenarioUrl(EXPERIMENT_SIZE_TOOL_PATH);
          }}
        />

        <section className="content-column">
          <section className="panel experiment-result-panel">
            <div className="panel__header panel__header--stacked">
              <div>
                <span className="eyebrow">Planning result</span>
                <h3>The main number to plan around</h3>
                <p>
                  Standard two-proportion sizing with equal traffic split across groups.
                </p>
              </div>
            </div>

            <div className="experiment-hero-metric">
              <span className="experiment-hero-metric__label">You need</span>
              <strong>
                <AnimatedNumber
                  value={outputs.sampleSizePerGroup}
                  format={(value) => `${Math.round(value).toLocaleString("en-US")} users per group`}
                />
              </strong>
              <p>
                Total sample size is {outputs.totalSampleSize.toLocaleString("en-US")} users across {outputs.groups} groups.
              </p>
              <span className="experiment-hero-metric__read">{outputs.sampleSizeRead}</span>
            </div>

            <div className="experiment-metrics-grid">
              <article className="metric-card metric-card--accent">
                <span className="metric-card__label">Absolute detectable lift</span>
                <strong className="metric-card__value">
                  {formatPercent(outputs.baselineRate)} → {formatPercent(outputs.targetRate)}
                </strong>
                <p className="metric-card__helper">
                  This is a {(outputs.absoluteLift * 100).toFixed(1)} percentage point lift.
                </p>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Estimated test duration</span>
                <strong className="metric-card__value">
                  {outputs.estimatedDurationDays
                    ? `${Math.ceil(outputs.estimatedDurationDays)} days`
                    : "Need traffic"}
                </strong>
                <p className="metric-card__helper">
                  {outputs.estimatedDurationDays
                    ? `~${Math.max(1, Math.ceil(outputs.estimatedDurationDays / 7))} weeks of traffic.`
                    : `At four weeks, you would want about ${outputs.requiredDailyUsersFor28Days.toLocaleString("en-US")} users per day.`}
                </p>
                {outputs.estimatedDurationDays ? (
                  <p className="metric-card__caption">
                    {outputs.durationRead ?? "Assuming stable daily traffic."}
                  </p>
                ) : (
                  <p className="metric-card__caption">Assuming stable daily traffic.</p>
                )}
              </article>

              <article className="metric-card metric-card--warning experiment-feasibility-card">
                <span className="metric-card__label">Feasibility status</span>
                <strong className="metric-card__value">{outputs.status}</strong>
                <p className="metric-card__helper">{outputs.statusReason}</p>
                <span className="experiment-feasibility-card__badge">
                  Main takeaway
                </span>
              </article>
            </div>

            {outputs.tradeoffHints.length > 0 ? (
              <div className="experiment-tradeoffs">
                {outputs.tradeoffHints.map((hint) => (
                  <span key={hint} className="experiment-tradeoffs__item">
                    {hint}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          <section className="panel snapshot-panel">
            <div className="panel__header">
              <div>
                <span className="eyebrow">Presentation snapshot</span>
                <h3>Export-ready planning card</h3>
                <p>Includes inputs, results, and the key feasibility insight.</p>
              </div>
            </div>

            <ExperimentSizeSnapshotCard
              inputs={normalizedInputs}
              outputs={outputs}
              isDownloading={isExportingSnapshot}
              onDownload={handleDownloadSnapshot}
            />
          </section>

          <section className="panel insight-panel experiment-insight-panel">
            <div className="panel__header panel__header--stacked">
              <div>
                <span className="eyebrow">Interpretation</span>
                <h3>{outputs.insightHeadline}</h3>
                <p>{outputs.insightBody}</p>
              </div>
            </div>

            <div className="experiment-status-chip">{outputs.status}</div>
            <p>{outputs.tradeoffLine}</p>
            <p>{outputs.groupsLine}</p>
            <p>{outputs.benchmarkLine}</p>
          </section>

          <ExperimentFaq />
        </section>
      </main>

      <div className="snapshot-export-root" aria-hidden="true">
        <div ref={exportSnapshotRef}>
          <ExperimentSizeSnapshotCard
            exportMode
            inputs={normalizedInputs}
            outputs={outputs}
          />
        </div>
      </div>
    </div>
  );
}
