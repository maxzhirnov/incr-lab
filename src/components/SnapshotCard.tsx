import { AnimatedNumber } from "./AnimatedNumber";
import type { Formatters } from "../lib/format";
import type { InsightContent } from "../lib/snapshotMessaging";
import type { SimulationOutputs } from "../lib/simulation";

type SnapshotCardProps = {
  outputs: SimulationOutputs;
  formatters: Formatters;
  insight: InsightContent;
  exportMode?: boolean;
  isDownloading?: boolean;
  onDownload?: () => void;
};

export function SnapshotCard({
  outputs,
  formatters,
  insight,
  exportMode = false,
  isDownloading = false,
  onDownload,
}: SnapshotCardProps) {
  return (
    <article
      className={`snapshot-card${exportMode ? " snapshot-card--export" : ""}`}
    >
      <header className="snapshot-card__header">
        <div>
          <span className="eyebrow">Incrementality Lab</span>
          <h3>Retargeting experiment</h3>
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
        <span className="snapshot-card__context">{insight.snapshot.contextLabel}</span>
        <h2>{insight.snapshot.headline}</h2>
        <p className="snapshot-card__so-what">{insight.snapshot.supportingLine}</p>
        <p className="snapshot-card__roas-line">
          {insight.snapshot.moneyLine.split(
            formatters.roasExplanation(outputs.attributedROAS),
          )[0]}
          <span
            className={
              outputs.attributedROAS < 1
                ? "snapshot-roas-inline snapshot-roas-inline--negative"
                : "snapshot-roas-inline"
            }
          >
            {formatters.roasExplanation(outputs.attributedROAS)}
          </span>
          {insight.snapshot.moneyLine
            .split(formatters.roasExplanation(outputs.attributedROAS))[1]
            .split(formatters.roasExplanation(outputs.incrementalROAS))[0]}
          <span
            className={
              outputs.incrementalROAS < 1
                ? "snapshot-roas-inline snapshot-roas-inline--negative"
                : "snapshot-roas-inline"
            }
          >
            {formatters.roasExplanation(outputs.incrementalROAS)}
          </span>
          {insight.snapshot.moneyLine.split(
            formatters.roasExplanation(outputs.incrementalROAS),
          )[1]}
        </p>
      </div>

      <div className="snapshot-card__delta">
        <strong>{insight.snapshot.explicitGapMetric}</strong>
      </div>

      <div className="snapshot-grid">
        <section className="snapshot-column snapshot-column--reported">
          <span className="snapshot-column__label">Reported performance</span>
          <div className="snapshot-column__value">
            <AnimatedNumber
              value={outputs.attributedConversions}
              format={formatters.count}
            />
          </div>
          <p>Attributed conversions</p>
          <div className="snapshot-column__metric">
            <span>ROAS</span>
            <div className="snapshot-column__metric-value">
              <strong
                className={
                  outputs.attributedROAS < 1
                    ? "snapshot-roas snapshot-roas--negative"
                    : "snapshot-roas"
                }
              >
                <AnimatedNumber
                  value={outputs.attributedROAS}
                  format={formatters.roas}
                />
              </strong>
              <small>{formatters.roasExplanation(outputs.attributedROAS)}</small>
            </div>
          </div>
        </section>

        <section className="snapshot-column snapshot-column--incremental">
          <span className="snapshot-column__label">Incremental reality</span>
          <div className="snapshot-column__value">
            <AnimatedNumber
              value={outputs.incrementalConversions}
              format={formatters.count}
            />
          </div>
          <p>Incremental conversions</p>
          <div className="snapshot-column__metric">
            <span>ROAS</span>
            <div className="snapshot-column__metric-value">
              <strong
                className={
                  outputs.incrementalROAS < 1
                    ? "snapshot-roas snapshot-roas--negative"
                    : "snapshot-roas"
                }
              >
                <AnimatedNumber
                  value={outputs.incrementalROAS}
                  format={formatters.roas}
                />
              </strong>
              <small>{formatters.roasExplanation(outputs.incrementalROAS)}</small>
            </div>
          </div>
        </section>
      </div>

      <div className="snapshot-gap">
        <strong>{insight.snapshot.gapLine}</strong>
        <span>
          <AnimatedNumber
            value={outputs.claimedButNonIncremental}
            format={formatters.count}
          />{" "}
          conversions were claimed, not created
        </span>
      </div>

      {exportMode ? (
        <footer className="snapshot-card__footer">
          <span>{insight.snapshotFooter}</span>
        </footer>
      ) : null}
    </article>
  );
}
