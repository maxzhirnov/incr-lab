import type { CurrencyCode } from "./format";
import type { SimulationInputs } from "./simulation";

type MoneyControlPreset = {
  min: number;
  max: number;
  step: number;
  defaultValue: number;
};

export type CurrencyMoneyPreset = {
  spend: MoneyControlPreset;
  revenuePerConversion: MoneyControlPreset;
};

export const currencyMoneyPresets: Record<CurrencyCode, CurrencyMoneyPreset> = {
  USD: {
    spend: { min: 1_000, max: 100_000, step: 1_000, defaultValue: 18_000 },
    revenuePerConversion: {
      min: 10,
      max: 1_000,
      step: 10,
      defaultValue: 140,
    },
  },
  EUR: {
    spend: { min: 1_000, max: 100_000, step: 1_000, defaultValue: 18_000 },
    revenuePerConversion: {
      min: 10,
      max: 1_000,
      step: 10,
      defaultValue: 140,
    },
  },
  GBP: {
    spend: { min: 1_000, max: 100_000, step: 1_000, defaultValue: 18_000 },
    revenuePerConversion: {
      min: 10,
      max: 1_000,
      step: 10,
      defaultValue: 140,
    },
  },
  RUB: {
    spend: {
      min: 100_000,
      max: 10_000_000,
      step: 100_000,
      defaultValue: 1_800_000,
    },
    revenuePerConversion: {
      min: 500,
      max: 100_000,
      step: 500,
      defaultValue: 14_000,
    },
  },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getCurrencyMoneyPreset = (currency: CurrencyCode) =>
  currencyMoneyPresets[currency];

export const withCurrencyMoneyDefaults = (
  base: Omit<SimulationInputs, "spend" | "revenuePerConversion">,
  currency: CurrencyCode,
): SimulationInputs => {
  const preset = getCurrencyMoneyPreset(currency);

  return {
    ...base,
    spend: preset.spend.defaultValue,
    revenuePerConversion: preset.revenuePerConversion.defaultValue,
  };
};

export const clampMoneyInputsForCurrency = (
  inputs: SimulationInputs,
  currency: CurrencyCode,
): SimulationInputs => {
  const preset = getCurrencyMoneyPreset(currency);

  return {
    ...inputs,
    spend: clamp(inputs.spend, preset.spend.min, preset.spend.max),
    revenuePerConversion: clamp(
      inputs.revenuePerConversion,
      preset.revenuePerConversion.min,
      preset.revenuePerConversion.max,
    ),
  };
};

export const resetMoneyInputsForCurrency = (
  inputs: SimulationInputs,
  currency: CurrencyCode,
): SimulationInputs => {
  const preset = getCurrencyMoneyPreset(currency);

  return {
    ...inputs,
    spend: preset.spend.defaultValue,
    revenuePerConversion: preset.revenuePerConversion.defaultValue,
  };
};
