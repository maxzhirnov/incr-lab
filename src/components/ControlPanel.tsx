import { benchmarkRanges, getBenchmarkStatus } from "../lib/benchmarks";
import { getCurrencyMoneyPreset } from "../lib/currencyPresets";
import type { CurrencyCode } from "../lib/format";
import { SliderField } from "./SliderField";
import type { SimulationInputs } from "../lib/simulation";

type ControlPanelProps = {
  currency: CurrencyCode;
  formatCurrency: (value: number) => string;
  inputs: SimulationInputs;
  onChange: (next: SimulationInputs) => void;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onReset: () => void;
};

const currencyOptions: CurrencyCode[] = ["USD", "EUR", "GBP", "RUB"];
const formatPercent = (value: number) => `${(value * 100).toFixed(0)}%`;
const formatNumber = (value: number) => value.toLocaleString("en-US");

const benchmarkStatusLabels = {
  above: "Above typical",
  below: "Below typical",
} as const;

export function ControlPanel({
  currency,
  formatCurrency,
  inputs,
  onChange,
  onCurrencyChange,
  onReset,
}: ControlPanelProps) {
  const maxConvertAnyway = 1 - inputs.pctPersuadable;
  const maxPersuadable = 1 - inputs.pctConvertAnyway;
  const moneyPreset = getCurrencyMoneyPreset(currency);

  const update = <K extends keyof SimulationInputs>(
    key: K,
    value: SimulationInputs[K],
  ) => {
    onChange({ ...inputs, [key]: value });
  };

  const getBenchmarkMeta = (key: keyof SimulationInputs) => {
    const benchmark = benchmarkRanges[key];

    if (!benchmark) {
      return {};
    }

    const status = getBenchmarkStatus(inputs[key] as number, benchmark.min, benchmark.max);

    return {
      benchmarkHint: benchmark.typicalLabel,
      statusLabel: status ? benchmarkStatusLabels[status] : undefined,
    };
  };

  return (
    <aside className="panel controls-panel">
      <div className="panel__header">
        <div>
          <span className="eyebrow">Scenario</span>
          <h2>Retargeting experiment</h2>
        </div>
        <button
          aria-label="Reset defaults"
          className="icon-button"
          onClick={onReset}
          title="Reset defaults"
          type="button"
        >
          <svg
            aria-hidden="true"
            className="icon-button__icon"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M4.583 6.25A5.833 5.833 0 1 1 4.167 10"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
            />
            <path
              d="M4.583 2.917v3.75h3.75"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
            />
          </svg>
        </button>
      </div>

      <SliderField
        label="Total users"
        value={inputs.totalUsers}
        min={10_000}
        max={500_000}
        step={5_000}
        displayValue={formatNumber(inputs.totalUsers)}
        hint="Size of the audience entering the retargeting pool."
        onChange={(value) => update("totalUsers", value)}
      />

      <label className="control-field">
        <div className="control-field__header">
          <span>Display currency</span>
          <strong>{currency}</strong>
        </div>
        <select
          className="control-select"
          value={currency}
          onChange={(event) => onCurrencyChange(event.target.value as CurrencyCode)}
        >
          {currencyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <p>
          Money ranges adjust with currency.
        </p>
      </label>

      <SliderField
        label="% users who would convert anyway"
        value={inputs.pctConvertAnyway}
        min={0}
        max={maxConvertAnyway}
        step={0.01}
        displayValue={formatPercent(inputs.pctConvertAnyway)}
        hint="These users buy even without ads."
        {...getBenchmarkMeta("pctConvertAnyway")}
        onChange={(value) => update("pctConvertAnyway", value)}
      />

      <SliderField
        label="% persuadable users"
        value={inputs.pctPersuadable}
        min={0}
        max={maxPersuadable}
        step={0.01}
        displayValue={formatPercent(inputs.pctPersuadable)}
        hint="These users can be influenced by retargeting."
        {...getBenchmarkMeta("pctPersuadable")}
        onChange={(value) => update("pctPersuadable", value)}
      />

      <SliderField
        label="Retargeting reach"
        value={inputs.retargetingReach}
        min={0}
        max={1}
        step={0.01}
        displayValue={formatPercent(inputs.retargetingReach)}
        hint="Share of both organic and persuadable users exposed to ads."
        {...getBenchmarkMeta("retargetingReach")}
        onChange={(value) => update("retargetingReach", value)}
      />

      <SliderField
        label="Persuadable conversion lift"
        value={inputs.persuadableConversionLift}
        min={0}
        max={1}
        step={0.01}
        displayValue={formatPercent(inputs.persuadableConversionLift)}
        hint="Chance that an exposed persuadable user converts because of ads."
        {...getBenchmarkMeta("persuadableConversionLift")}
        onChange={(value) => update("persuadableConversionLift", value)}
      />

      <SliderField
        label="Media spend"
        value={inputs.spend}
        min={moneyPreset.spend.min}
        max={moneyPreset.spend.max}
        step={moneyPreset.spend.step}
        displayValue={formatCurrency(inputs.spend)}
        hint="Total spend assigned to this retargeting campaign."
        onChange={(value) => update("spend", value)}
      />

      <SliderField
        label="Revenue per conversion"
        value={inputs.revenuePerConversion}
        min={moneyPreset.revenuePerConversion.min}
        max={moneyPreset.revenuePerConversion.max}
        step={moneyPreset.revenuePerConversion.step}
        displayValue={formatCurrency(inputs.revenuePerConversion)}
        hint="Average revenue generated per conversion."
        onChange={(value) => update("revenuePerConversion", value)}
      />

      <div className="controls-note">
        <strong>Model guardrail</strong>
        <p>
          Users who convert anyway and persuadable users cannot exceed 100% of
          the audience combined.
        </p>
        <p className="controls-note__secondary">
          Defaults represent a typical mid-range marketing scenario.
        </p>
      </div>

      <p className="controls-context">
        Indicative ranges based on common performance scenarios
      </p>
    </aside>
  );
}
