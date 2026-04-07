type InsightBlockProps = {
  headline: string;
  supportingLine: string;
  moneyLine: string;
  gapHighlight: string;
};

export function InsightBlock({
  headline,
  supportingLine,
  moneyLine,
  gapHighlight,
}: InsightBlockProps) {
  return (
    <section className="panel insight-panel">
      <span className="eyebrow">Key takeaway</span>
      <h3>{headline}</h3>
      <p>{supportingLine}</p>
      <p>{moneyLine}</p>
      <strong className="insight-panel__highlight">{gapHighlight}</strong>
    </section>
  );
}
