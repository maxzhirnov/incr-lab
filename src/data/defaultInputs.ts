import { withCurrencyMoneyDefaults } from "../lib/currencyPresets";
import type { SimulationInputs } from "../lib/simulation";

const baseInputs: Omit<SimulationInputs, "spend" | "revenuePerConversion"> = {
  totalUsers: 100_000,
  pctConvertAnyway: 0.12,
  pctPersuadable: 0.18,
  retargetingReach: 0.7,
  persuadableConversionLift: 0.22,
};

export const defaultInputs: SimulationInputs = withCurrencyMoneyDefaults(
  baseInputs,
  "USD",
);
