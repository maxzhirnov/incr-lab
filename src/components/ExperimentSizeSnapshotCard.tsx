import { AnimatedNumber } from "./AnimatedNumber";
import type { ExperimentSizeInputs, ExperimentSizeOutputs } from "../lib/experimentSize";

type ExperimentSizeSnapshotCardProps = {
  inputs: ExperimentSizeInputs;
  outputs: ExperimentSizeOutputs;
  exportMode?: boolean;
  isDownloading?: boolean;
  onDownload?: () => void;
};

const formatPercent = (value: number, digits = 1) =>
  `${(value * 100).toFixed(digits)}%`;

export function ExperimentSizeSnapshotCard({
  inputs,
  outputs,
  exportMode = false,
  isDownloading = false,
  onDownload,
}: ExperimentSizeSnapshotCardProps) {
  const weeks =
    outputs.estimatedDurationDays !== null
      ? Math.max(1, Math.ceil(outputs.estimatedDurationDays / 7))
      : null;
  const interpretation = outputs.estimatedDurationDays
    ? `This needs about ${weeks} week${weeks === 1 ? "" : "s"} of traffic at the current pace.`
    : `This needs about ${outputs.requiredDailyUsersFor28Days.toLocaleString("en-US")} users per day to finish in 4 weeks.`;
  const takeaway =
    outputs.status === "Realistic"
      ? "This experiment looks realistic to run."
      : outputs.status === "Possible but expensive"
        ? "This setup requires high traffic."
        : outputs.status === "Likely underpowered"
          ? "This experiment is likely underpowered."
          : "This will be difficult to run reliably.";
  const keyTakeaway =
    outputs.groups > 2
      ? "Too many groups are driving sample size up."
      : outputs.relativeMde < 0.1
        ? "A larger MDE would significantly cut required traffic."
        : outputs.significance === 0.99
          ? "99% significance is pushing sample requirements higher."
          : "Stable daily traffic is the main constraint.";
  const setupLine = [
    `Baseline ${formatPercent(inputs.baselineRate)}`,
    `MDE ${formatPercent(inputs.relativeMde, 0)}`,
    `${formatPercent(inputs.significance, 0)} sig`,
    `${formatPercent(inputs.power, 0)} power`,
    `${inputs.groups} groups`,
  ].join(" · ");
  const secondaryMetricValue = outputs.estimatedDurationDays
    ? `~${weeks} week${weeks === 1 ? "" : "s"}`
    : `~${outputs.requiredDailyUsersFor28Days.toLocaleString("en-US")}/day`;
  const secondaryMetricLabel = outputs.estimatedDurationDays
    ? "At current traffic"
    : "Needed for 4 weeks";
  const statusSignal =
    outputs.status === "Realistic"
      ? "Ready to run"
      : outputs.status === "Possible but expensive"
        ? "High traffic requirement"
        : outputs.status === "Likely underpowered"
          ? "Hard to run"
          : "Redesign likely";
  const supportingLine = outputs.estimatedDurationDays
    ? `Duration ${Math.ceil(outputs.estimatedDurationDays)} days · Lift +${(outputs.absoluteLift * 100).toFixed(1)} pp`
    : `Lift +${(outputs.absoluteLift * 100).toFixed(1)} pp · ${outputs.requiredDailyUsersFor28Days.toLocaleString("en-US")} users/day target`;

  return (
    <article
      className={`snapshot-card experiment-snapshot${
        exportMode ? " snapshot-card--export" : ""
      }`}
    >
      <header className="snapshot-card__header">
        <div>
          <span className="eyebrow">Incrementality Lab</span>
          <h3>Experiment size calculator</h3>
        </div>
        {!exportMode && onDownload ? (
          <button
            aria-label="Download snapshot"
            className="icon-button snapshot-card__download"
            disabled={isDownloading}
            onClick={onDownload}
            title="Download snapshot"
            type="button"
          >
            <svg
              aria-hidden="true"
              className="icon-button__icon"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M10 3.75v8.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
              <path
                d="M6.667 9.583 10 12.917l3.333-3.334"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
              <path
                d="M4.167 15.417h11.666"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
          </button>
        ) : null}
      </header>

      <div className="snapshot-card__headline">
        <span className="snapshot-card__context">Experiment planning snapshot</span>
        <h2>
          You need{" "}
          <AnimatedNumber
            value={outputs.sampleSizePerGroup}
            format={(value) => Math.round(value).toLocaleString("en-US")}
          />{" "}
          users per group
        </h2>
        <p className="snapshot-card__so-what">{interpretation}</p>
      </div>

      <div className="snapshot-card__delta">
        <strong>{takeaway}</strong>
      </div>

      <div className="experiment-snapshot__metric-band">
        <section className="experiment-snapshot__metric-panel experiment-snapshot__metric-panel--primary">
          <span className="snapshot-column__label">{secondaryMetricLabel}</span>
          <strong className="experiment-snapshot__metric-value">
            {secondaryMetricValue}
          </strong>
          <p>{outputs.estimatedDurationDays ? "Based on current traffic" : "Traffic needed to finish on time"}</p>
        </section>

        <section className="experiment-snapshot__metric-panel experiment-snapshot__metric-panel--status">
          <span className="experiment-snapshot__status">{statusSignal}</span>
          <p>{supportingLine}</p>
        </section>
      </div>

      <div className="experiment-snapshot__summary">
        <span className="snapshot-column__label">Setup</span>
        <p className="experiment-snapshot__inline">{setupLine}</p>
        <div className="experiment-snapshot__list">
          <span>
            Lift {formatPercent(outputs.baselineRate)} → {formatPercent(outputs.targetRate)}
          </span>
          <span>Total sample {outputs.totalSampleSize.toLocaleString("en-US")}</span>
        </div>
      </div>

      <div className="snapshot-gap">
        <strong>Key takeaway</strong>
        <span>{keyTakeaway}</span>
      </div>

      {exportMode ? (
        <footer className="snapshot-card__footer">
          <span>Incrementality Lab • lab.mzhirnov.com</span>
        </footer>
      ) : null}
    </article>
  );
}
