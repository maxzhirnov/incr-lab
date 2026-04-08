import {
  defaultExperimentSizeInputs,
  normalizeExperimentSizeInputs,
  type ExperimentSizeInputs,
} from "./experimentSize";

export const EXPERIMENT_SIZE_TOOL_PATH = "/experiment-size";

type ScenarioState = {
  inputs: ExperimentSizeInputs;
  hasQueryParams: boolean;
};

const paramMap: Record<keyof ExperimentSizeInputs, string> = {
  baselineRate: "baseline",
  relativeMde: "mde",
  significance: "sig",
  power: "power",
  groups: "groups",
  dailyUsers: "dailyUsers",
  dailyConversions: "dailyConv",
};

const readNumber = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const readExperimentSizeFromUrl = (
  defaults: ExperimentSizeInputs = defaultExperimentSizeInputs,
): ScenarioState => {
  if (typeof window === "undefined") {
    return { inputs: defaults, hasQueryParams: false };
  }

  const params = new URLSearchParams(window.location.search);
  const hasQueryParams = Array.from(params.keys()).length > 0;

  if (!hasQueryParams) {
    return { inputs: defaults, hasQueryParams: false };
  }

  return {
    hasQueryParams,
    inputs: normalizeExperimentSizeInputs({
      baselineRate: readNumber(params.get(paramMap.baselineRate), defaults.baselineRate),
      relativeMde: readNumber(params.get(paramMap.relativeMde), defaults.relativeMde),
      significance: readNumber(
        params.get(paramMap.significance),
        defaults.significance,
      ) as ExperimentSizeInputs["significance"],
      power: readNumber(params.get(paramMap.power), defaults.power) as ExperimentSizeInputs["power"],
      groups: readNumber(params.get(paramMap.groups), defaults.groups),
      dailyUsers: readNumber(params.get(paramMap.dailyUsers), defaults.dailyUsers),
      dailyConversions: readNumber(
        params.get(paramMap.dailyConversions),
        defaults.dailyConversions,
      ),
    }),
  };
};

export const writeExperimentSizeToUrl = (inputs: ExperimentSizeInputs) => {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams();

  params.set(paramMap.baselineRate, inputs.baselineRate.toFixed(4));
  params.set(paramMap.relativeMde, inputs.relativeMde.toFixed(4));
  params.set(paramMap.significance, inputs.significance.toString());
  params.set(paramMap.power, inputs.power.toString());
  params.set(paramMap.groups, String(inputs.groups));

  if (inputs.dailyUsers > 0) {
    params.set(paramMap.dailyUsers, String(Math.round(inputs.dailyUsers)));
  }

  if (inputs.dailyConversions > 0) {
    params.set(paramMap.dailyConversions, String(Math.round(inputs.dailyConversions)));
  }

  window.history.replaceState({}, "", `${EXPERIMENT_SIZE_TOOL_PATH}?${params.toString()}`);
};

export const getCanonicalExperimentSizeUrl = (inputs: ExperimentSizeInputs) => {
  const params = new URLSearchParams();

  params.set(paramMap.baselineRate, inputs.baselineRate.toFixed(4));
  params.set(paramMap.relativeMde, inputs.relativeMde.toFixed(4));
  params.set(paramMap.significance, inputs.significance.toString());
  params.set(paramMap.power, inputs.power.toString());
  params.set(paramMap.groups, String(inputs.groups));

  if (inputs.dailyUsers > 0) {
    params.set(paramMap.dailyUsers, String(Math.round(inputs.dailyUsers)));
  }

  if (inputs.dailyConversions > 0) {
    params.set(paramMap.dailyConversions, String(Math.round(inputs.dailyConversions)));
  }

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://lab.mzhirnov.com";

  return `${origin}${EXPERIMENT_SIZE_TOOL_PATH}?${params.toString()}`;
};

export const isDefaultExperimentSizeState = (
  inputs: ExperimentSizeInputs,
  defaults: ExperimentSizeInputs = defaultExperimentSizeInputs,
) => {
  const a = normalizeExperimentSizeInputs(inputs);
  const b = normalizeExperimentSizeInputs(defaults);

  return (
    a.baselineRate === b.baselineRate &&
    a.relativeMde === b.relativeMde &&
    a.significance === b.significance &&
    a.power === b.power &&
    a.groups === b.groups &&
    a.dailyUsers === b.dailyUsers &&
    a.dailyConversions === b.dailyConversions
  );
};
