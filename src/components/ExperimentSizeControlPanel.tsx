import { useEffect, useRef, useState } from "react";
import { ControlFieldAssist } from "./ControlFieldAssist";
import { RangeNumberField } from "./RangeNumberField";
import type { ExperimentSizeInputs } from "../lib/experimentSize";

type ExperimentSizeControlPanelProps = {
  inputs: ExperimentSizeInputs;
  onChange: (next: ExperimentSizeInputs) => void;
  onReset: () => void;
};

const percent = (value: number, digits = 0) => `${(value * 100).toFixed(digits)}%`;

export function ExperimentSizeControlPanel({
  inputs,
  onChange,
  onReset,
}: ExperimentSizeControlPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const [desktopMaxHeight, setDesktopMaxHeight] = useState<number | null>(null);

  const update = <K extends keyof ExperimentSizeInputs>(
    key: K,
    value: ExperimentSizeInputs[K],
  ) => {
    onChange({ ...inputs, [key]: value });
  };

  const mdeStatus =
    inputs.relativeMde < 0.05
      ? "Very hard to detect"
      : inputs.relativeMde < 0.1
        ? "Ambitious"
        : inputs.relativeMde < 0.2
          ? "Typical"
          : "Easier";

  const groupsStatus =
    inputs.groups <= 3 ? "Normal" : inputs.groups === 4 ? "Caution" : "Warning";
  const hasDailyUsers = inputs.dailyUsers > 0;
  const hasDailyConversions = inputs.dailyConversions > 0;

  useEffect(() => {
    const updateDesktopMaxHeight = () => {
      if (!panelRef.current) {
        return;
      }

      if (window.innerWidth <= 1100) {
        setDesktopMaxHeight(null);
        return;
      }

      const rect = panelRef.current.getBoundingClientRect();
      const viewportPadding = 20;
      const availableHeight = window.innerHeight - rect.top - viewportPadding;

      setDesktopMaxHeight(Math.max(320, Math.floor(availableHeight)));
    };

    updateDesktopMaxHeight();
    window.addEventListener("resize", updateDesktopMaxHeight);
    window.addEventListener("scroll", updateDesktopMaxHeight, { passive: true });

    return () => {
      window.removeEventListener("resize", updateDesktopMaxHeight);
      window.removeEventListener("scroll", updateDesktopMaxHeight);
    };
  }, []);

  return (
    <aside
      className="panel controls-panel experiment-controls"
      ref={panelRef}
      style={
        desktopMaxHeight
          ? { maxHeight: `${desktopMaxHeight}px` }
          : undefined
      }
    >
      <div className="panel__header">
        <div>
          <span className="eyebrow">Scenario</span>
          <h2>Experiment planning</h2>
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

      <RangeNumberField
        label="Baseline conversion rate"
        value={inputs.baselineRate}
        min={0.001}
        max={0.3}
        step={0.001}
        displayValue={percent(inputs.baselineRate, 1)}
        helper="Baseline conversion rate before any lift"
        detail="Used as the control for comparison. Lower baselines usually need more traffic for the same relative lift."
        inputSuffix="%"
        inputMultiplier={100}
        onChange={(value) => update("baselineRate", value)}
      />

      <RangeNumberField
        label="Minimum detectable effect"
        value={inputs.relativeMde}
        min={0.01}
        max={0.5}
        step={0.005}
        displayValue={percent(inputs.relativeMde, 1)}
        helper={
          inputs.relativeMde < 0.05
            ? "Below 5% is hard to detect"
            : inputs.relativeMde < 0.1
              ? "Small effects require much more data"
              : inputs.relativeMde < 0.2
                ? "A practical range for many tests"
                : "Easier to power, but often less realistic"
        }
        detail="MDE is the relative uplift the test is designed to detect. Smaller MDE means more sensitivity, but much larger sample sizes."
        statusLabel={mdeStatus}
        inputSuffix="%"
        inputMultiplier={100}
        onChange={(value) => update("relativeMde", value)}
      />

      <div className="control-field">
        <div className="control-field__header">
          <span className="control-field__label">Statistical significance</span>
          <strong>{percent(inputs.significance)}</strong>
        </div>
        <div className="segmented-control">
          {[0.9, 0.95, 0.99].map((option) => (
            <button
              key={option}
              className={`segmented-control__button${
                inputs.significance === option ? " segmented-control__button--active" : ""
              }`}
              onClick={() => update("significance", option as ExperimentSizeInputs["significance"])}
              type="button"
            >
              {percent(option)}
            </button>
          ))}
        </div>
        <ControlFieldAssist
          detail="This sets the confidence threshold for interpreting a result. Higher significance requires more data."
          helper={
            inputs.significance === 0.95
              ? "95% is standard"
              : inputs.significance === 0.99
                ? "99% is stricter and more expensive"
                : "90% is lighter, but less strict"
          }
        />
      </div>

      <div className="control-field">
        <div className="control-field__header">
          <span className="control-field__label">Statistical power</span>
          <strong>{percent(inputs.power)}</strong>
        </div>
        <div className="segmented-control">
          {[0.8, 0.9].map((option) => (
            <button
              key={option}
              className={`segmented-control__button${
                inputs.power === option ? " segmented-control__button--active" : ""
              }`}
              onClick={() => update("power", option as ExperimentSizeInputs["power"])}
              type="button"
            >
              {percent(option)}
            </button>
          ))}
        </div>
        <ControlFieldAssist
          detail="Power is the chance of detecting the effect if it truly exists. Higher power reduces false negatives, but increases sample size."
          helper={
            inputs.power === 0.8
              ? "80% is a common default"
              : "Higher power needs more sample"
          }
        />
      </div>

      <RangeNumberField
        label="Number of groups"
        value={inputs.groups}
        min={2}
        max={6}
        step={1}
        displayValue={`${inputs.groups} groups`}
        helper="Traffic is split evenly across groups"
        detail="Each extra group increases required sample size and slows experiments. Two or three groups are usually the most practical."
        statusLabel={groupsStatus}
        onChange={(value) => update("groups", Math.round(value))}
      />

      <RangeNumberField
        label="Daily users"
        value={inputs.dailyUsers}
        min={0}
        max={250000}
        step={500}
        displayValue={inputs.dailyUsers > 0 ? inputs.dailyUsers.toLocaleString("en-US") : "Optional"}
        helper={
          hasDailyConversions
            ? "Clear daily conversions to use users instead"
            : "Optional input for duration estimates"
        }
        detail="Use daily eligible users if you know traffic volume. The calculator uses this to estimate how long the test may take."
        allowEmpty
        disabled={hasDailyConversions}
        clearLabel="Clear daily users"
        onClear={() =>
          onChange({
            ...inputs,
            dailyUsers: 0,
          })
        }
        onChange={(value) =>
          onChange({
            ...inputs,
            dailyUsers: value,
            dailyConversions: value > 0 ? 0 : inputs.dailyConversions,
          })
        }
      />

      <RangeNumberField
        label="Daily conversions"
        value={inputs.dailyConversions}
        min={0}
        max={10000}
        step={25}
        displayValue={
          inputs.dailyConversions > 0
            ? inputs.dailyConversions.toLocaleString("en-US")
            : "Optional"
        }
        helper={
          hasDailyUsers
            ? "Clear daily users to use conversions instead"
            : "Alternative to users if conversions are easier to estimate"
        }
        detail="If both traffic fields are filled, daily users is used for duration. Daily conversions are converted back into implied traffic using the baseline rate."
        allowEmpty
        disabled={hasDailyUsers}
        clearLabel="Clear daily conversions"
        onClear={() =>
          onChange({
            ...inputs,
            dailyConversions: 0,
          })
        }
        onChange={(value) =>
          onChange({
            ...inputs,
            dailyConversions: value,
            dailyUsers: value > 0 ? 0 : inputs.dailyUsers,
          })
        }
      />

      <div className="controls-note">
        <strong>Planning note</strong>
        <p>
          More groups increase required sample size and slow down experiments.
        </p>
        <p className="controls-note__secondary">
          Use this as a directional planning model, not a substitute for experiment QA.
        </p>
      </div>
    </aside>
  );
}
