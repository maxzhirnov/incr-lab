import { AnimatedNumber } from "./AnimatedNumber";
import type { Formatters } from "../lib/format";
import type { SimulationOutputs } from "../lib/simulation";
import { MetricCard } from "./MetricCard";

type MetricsGridProps = {
  outputs: SimulationOutputs;
  formatters: Formatters;
};

export function MetricsGrid({ outputs, formatters }: MetricsGridProps) {
  return (
    <section className="metrics-grid">
      <MetricCard
        label="Conversions without ads"
        value={
          <AnimatedNumber
            value={outputs.baselineConversions}
            format={formatters.count}
          />
        }
        caption="Users who convert even if retargeting does nothing."
      />
      <MetricCard
        label="Conversions with ads"
        value={
          <AnimatedNumber
            value={outputs.totalConversionsWithAds}
            format={formatters.count}
          />
        }
        tone="accent"
        caption="Baseline conversions plus the incremental lift from exposed persuadable users."
      />
      <MetricCard
        label="Attributed conversions"
        value={
          <AnimatedNumber
            value={outputs.attributedConversions}
            format={formatters.count}
          />
        }
        caption="Conversions the channel can claim because users were exposed."
      />
      <MetricCard
        label="Incremental conversions"
        value={
          <AnimatedNumber
            value={outputs.incrementalConversions}
            format={formatters.count}
          />
        }
        tone="accent"
        caption="The conversions that the campaign actually creates."
      />
      <MetricCard
        label="Overstatement multiple"
        value={
          <AnimatedNumber
            value={outputs.overstatementMultiple}
            format={formatters.multiple}
          />
        }
        tone="warning"
        caption="How much larger reported conversions are than incremental conversions."
      />
      <MetricCard
        label="Non-incremental share"
        value={
          <AnimatedNumber
            value={outputs.claimedShare}
            format={(value) => formatters.percent(value)}
          />
        }
        tone="warning"
        caption="Share of reported conversions that would likely happen without ads."
      />
      <MetricCard
        label="Estimated wasted spend"
        value={
          <AnimatedNumber
            value={outputs.wastedSpendEstimate}
            format={formatters.currency}
          />
        }
        tone="warning"
        caption="A simple heuristic: spend multiplied by the non-incremental share."
      />
      <MetricCard
        label="Attributed ROAS"
        value={
          <span
            className={
              outputs.attributedROAS < 1 ? "roas-value roas-value--negative" : undefined
            }
          >
            <AnimatedNumber
              value={outputs.attributedROAS}
              format={formatters.roas}
            />
          </span>
        }
        helper={formatters.roasExplanation(outputs.attributedROAS)}
        caption="Reported efficiency using all claimed conversions."
      />
      <MetricCard
        label="Incremental ROAS"
        value={
          <span
            className={
              outputs.incrementalROAS < 1 ? "roas-value roas-value--negative" : undefined
            }
          >
            <AnimatedNumber
              value={outputs.incrementalROAS}
              format={formatters.roas}
            />
          </span>
        }
        tone="accent"
        helper={formatters.roasExplanation(outputs.incrementalROAS)}
        caption="Return based only on conversions created by ads."
      />
    </section>
  );
}
