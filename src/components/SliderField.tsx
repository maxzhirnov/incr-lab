type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  hint: string;
  benchmarkHint?: string;
  statusLabel?: string;
  onChange: (value: number) => void;
};

export function SliderField({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  hint,
  benchmarkHint,
  statusLabel,
  onChange,
}: SliderFieldProps) {
  return (
    <label className="control-field">
      <div className="control-field__header">
        <span className="control-field__label">{label}</span>
        <div className="control-field__value-group">
          <span
            aria-hidden={statusLabel ? undefined : true}
            className={`control-field__status${
              statusLabel ? "" : " control-field__status--hidden"
            }`}
          >
            {statusLabel ?? "Above typical"}
          </span>
          <strong>{displayValue}</strong>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <p>{hint}</p>
      {benchmarkHint ? (
        <span className="control-field__benchmark">{benchmarkHint}</span>
      ) : null}
    </label>
  );
}
