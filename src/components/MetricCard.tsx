import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  tone?: "default" | "accent" | "warning";
  caption: string;
  helper?: string;
};

export function MetricCard({
  label,
  value,
  tone = "default",
  caption,
  helper,
}: MetricCardProps) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
      {helper ? <p className="metric-card__helper">{helper}</p> : null}
      <p className="metric-card__caption">{caption}</p>
    </article>
  );
}
