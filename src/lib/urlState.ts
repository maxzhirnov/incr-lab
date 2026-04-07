import { clampMoneyInputsForCurrency } from "./currencyPresets";
import { currencyOptions, type CurrencyCode } from "./format";
import { normalizeInputs, type SimulationInputs } from "./simulation";

export type ScenarioState = {
  inputs: SimulationInputs;
  currency: CurrencyCode;
  hasQueryParams: boolean;
};

const numericParamMap: Record<keyof SimulationInputs, string> = {
  totalUsers: "users",
  pctConvertAnyway: "convertAnyway",
  pctPersuadable: "persuadable",
  retargetingReach: "reach",
  persuadableConversionLift: "lift",
  spend: "spend",
  revenuePerConversion: "revenue",
};

const readNumber = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const readScenarioFromUrl = (
  defaults: SimulationInputs,
  defaultCurrency: CurrencyCode,
): ScenarioState => {
  if (typeof window === "undefined") {
    return { inputs: defaults, currency: defaultCurrency, hasQueryParams: false };
  }

  const params = new URLSearchParams(window.location.search);
  const hasQueryParams = Array.from(params.keys()).length > 0;

  if (!hasQueryParams) {
    return {
      inputs: defaults,
      currency: defaultCurrency,
      hasQueryParams: false,
    };
  }

  const requestedCurrency = params.get("currency");
  const currency = currencyOptions.includes(requestedCurrency as CurrencyCode)
    ? (requestedCurrency as CurrencyCode)
    : defaultCurrency;

  const inputs = normalizeInputs(
    clampMoneyInputsForCurrency(
      {
        totalUsers: readNumber(
          params.get(numericParamMap.totalUsers),
          defaults.totalUsers,
        ),
        pctConvertAnyway: readNumber(
          params.get(numericParamMap.pctConvertAnyway),
          defaults.pctConvertAnyway,
        ),
        pctPersuadable: readNumber(
          params.get(numericParamMap.pctPersuadable),
          defaults.pctPersuadable,
        ),
        retargetingReach: readNumber(
          params.get(numericParamMap.retargetingReach),
          defaults.retargetingReach,
        ),
        persuadableConversionLift: readNumber(
          params.get(numericParamMap.persuadableConversionLift),
          defaults.persuadableConversionLift,
        ),
        spend: readNumber(params.get(numericParamMap.spend), defaults.spend),
        revenuePerConversion: readNumber(
          params.get(numericParamMap.revenuePerConversion),
          defaults.revenuePerConversion,
        ),
      },
      currency,
    ),
  );

  return {
    inputs,
    currency,
    hasQueryParams,
  };
};

export const writeScenarioToUrl = (
  inputs: SimulationInputs,
  currency: CurrencyCode,
) => {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams();

  params.set(numericParamMap.totalUsers, String(Math.round(inputs.totalUsers)));
  params.set(
    numericParamMap.pctConvertAnyway,
    inputs.pctConvertAnyway.toFixed(4),
  );
  params.set(
    numericParamMap.pctPersuadable,
    inputs.pctPersuadable.toFixed(4),
  );
  params.set(
    numericParamMap.retargetingReach,
    inputs.retargetingReach.toFixed(4),
  );
  params.set(
    numericParamMap.persuadableConversionLift,
    inputs.persuadableConversionLift.toFixed(4),
  );
  params.set(numericParamMap.spend, String(Math.round(inputs.spend)));
  params.set(
    numericParamMap.revenuePerConversion,
    String(Math.round(inputs.revenuePerConversion)),
  );
  params.set("currency", currency);

  const query = params.toString();
  const nextUrl = `${window.location.pathname}?${query}`;
  window.history.replaceState({}, "", nextUrl);
};

export const clearScenarioUrl = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.history.replaceState({}, "", window.location.pathname);
};

export const isDefaultScenarioState = (
  inputs: SimulationInputs,
  currency: CurrencyCode,
  defaults: SimulationInputs,
  defaultCurrency: CurrencyCode,
) => {
  const normalizedInputs = normalizeInputs(inputs);
  const normalizedDefaults = normalizeInputs(defaults);

  return (
    currency === defaultCurrency &&
    normalizedInputs.totalUsers === normalizedDefaults.totalUsers &&
    normalizedInputs.pctConvertAnyway === normalizedDefaults.pctConvertAnyway &&
    normalizedInputs.pctPersuadable === normalizedDefaults.pctPersuadable &&
    normalizedInputs.retargetingReach === normalizedDefaults.retargetingReach &&
    normalizedInputs.persuadableConversionLift ===
      normalizedDefaults.persuadableConversionLift &&
    normalizedInputs.spend === normalizedDefaults.spend &&
    normalizedInputs.revenuePerConversion ===
      normalizedDefaults.revenuePerConversion
  );
};
