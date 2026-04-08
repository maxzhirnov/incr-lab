import { ControlFieldAssist } from "./ControlFieldAssist";

type RangeNumberFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  helper: string;
  detail?: string;
  statusLabel?: string;
  inputSuffix?: string;
  inputMultiplier?: number;
  allowEmpty?: boolean;
  disabled?: boolean;
  clearLabel?: string;
  onClear?: () => void;
  onChange: (value: number) => void;
};

export function RangeNumberField({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  helper,
  detail,
  statusLabel,
  inputSuffix,
  inputMultiplier = 1,
  allowEmpty = false,
  disabled = false,
  clearLabel,
  onClear,
  onChange,
}: RangeNumberFieldProps) {
  const decimals = step < 1 ? String(step).split(".")[1]?.length ?? 0 : 0;
  const canClear = Boolean(onClear) && value > 0;

  return (
    <label className={`control-field${disabled ? " control-field--disabled" : ""}`}>
      <div className="control-field__header">
        <span className="control-field__label">{label}</span>
        <div className="control-field__value-group">
          <span
            aria-hidden={statusLabel ? undefined : true}
            className={`control-field__status${
              statusLabel ? "" : " control-field__status--hidden"
            }`}
          >
            {statusLabel ?? "Typical"}
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
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="control-field__input-row">
        <input
          className="control-number-input"
          inputMode="decimal"
          type="number"
          min={min * inputMultiplier}
          max={max * inputMultiplier}
          step={step * inputMultiplier}
          disabled={disabled}
          value={
            allowEmpty && value === 0
              ? ""
              : Number((value * inputMultiplier).toFixed(decimals))
          }
          onChange={(event) => {
            const raw = event.target.value;

            if (allowEmpty && raw === "") {
              onChange(0);
              return;
            }

            const nextValue = Number(raw);

            if (Number.isFinite(nextValue)) {
              onChange(nextValue / inputMultiplier);
            }
          }}
        />
        {canClear ? (
          <button
            aria-label={clearLabel ?? `Clear ${label}`}
            className="control-number-input__clear"
            onClick={(event) => {
              event.preventDefault();
              onClear?.();
            }}
            title={clearLabel ?? `Clear ${label}`}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="control-number-input__clear-icon"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M6 6l8 8M14 6l-8 8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
          </button>
        ) : null}
        {inputSuffix ? <span className="control-number-input__suffix">{inputSuffix}</span> : null}
      </div>
      <ControlFieldAssist detail={detail} helper={helper} />
    </label>
  );
}
