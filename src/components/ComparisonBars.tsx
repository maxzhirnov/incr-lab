type BarDatum = {
  label: string;
  value: number;
  colorClass: string;
  valueLabel: string;
};

type ComparisonBarsProps = {
  title: string;
  subtitle: string;
  items: BarDatum[];
};

export function ComparisonBars({
  title,
  subtitle,
  items,
}: ComparisonBarsProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <section className="panel chart-panel">
      <div className="panel__header panel__header--stacked">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="bar-chart">
        {items.map((item) => (
          <div className="bar-row" key={item.label}>
            <div className="bar-row__meta">
              <span>{item.label}</span>
              <strong>{item.valueLabel}</strong>
            </div>
            <div className="bar-track">
              <div
                className={`bar-fill ${item.colorClass}`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
