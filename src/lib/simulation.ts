export type SimulationInputs = {
  totalUsers: number;
  pctConvertAnyway: number;
  pctPersuadable: number;
  retargetingReach: number;
  persuadableConversionLift: number;
  spend: number;
  revenuePerConversion: number;
};

export type SimulationOutputs = {
  totalUsers: number;
  spend: number;
  revenuePerConversion: number;
  convertAnywayUsers: number;
  persuadableUsers: number;
  lostUsers: number;
  exposedConvertAnywayUsers: number;
  exposedPersuadableUsers: number;
  baselineConversions: number;
  totalConversionsWithAds: number;
  incrementalConversions: number;
  attributedConversions: number;
  claimedButNonIncremental: number;
  claimedShare: number;
  overstatementMultiple: number;
  wastedSpendEstimate: number;
  attributedROAS: number;
  incrementalROAS: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const normalizeInputs = (inputs: SimulationInputs): SimulationInputs => {
  const pctConvertAnyway = clamp(inputs.pctConvertAnyway, 0, 1);
  const pctPersuadable = clamp(inputs.pctPersuadable, 0, 1 - pctConvertAnyway);

  return {
    totalUsers: Math.max(0, inputs.totalUsers),
    pctConvertAnyway,
    pctPersuadable,
    retargetingReach: clamp(inputs.retargetingReach, 0, 1),
    persuadableConversionLift: clamp(inputs.persuadableConversionLift, 0, 1),
    spend: Math.max(0, inputs.spend),
    revenuePerConversion: Math.max(0, inputs.revenuePerConversion),
  };
};

export const runSimulation = (rawInputs: SimulationInputs): SimulationOutputs => {
  const inputs = normalizeInputs(rawInputs);

  const convertAnywayUsers = inputs.totalUsers * inputs.pctConvertAnyway;
  const persuadableUsers = inputs.totalUsers * inputs.pctPersuadable;
  const lostUsers = Math.max(
    inputs.totalUsers - convertAnywayUsers - persuadableUsers,
    0,
  );

  const exposedConvertAnywayUsers =
    convertAnywayUsers * inputs.retargetingReach;
  const exposedPersuadableUsers =
    persuadableUsers * inputs.retargetingReach;

  const baselineConversions = convertAnywayUsers;
  const incrementalConversions =
    exposedPersuadableUsers * inputs.persuadableConversionLift;
  const totalConversionsWithAds =
    baselineConversions + incrementalConversions;

  const attributedConversions =
    exposedConvertAnywayUsers + incrementalConversions;

  const claimedButNonIncremental = Math.max(
    attributedConversions - incrementalConversions,
    0,
  );
  const claimedShare =
    attributedConversions > 0
      ? claimedButNonIncremental / attributedConversions
      : 0;
  const overstatementMultiple =
    incrementalConversions > 0
      ? attributedConversions / incrementalConversions
      : attributedConversions > 0
        ? Number.POSITIVE_INFINITY
        : 1;
  const wastedSpendEstimate = inputs.spend * claimedShare;

  const attributedROAS =
    inputs.spend > 0
      ? (attributedConversions * inputs.revenuePerConversion) / inputs.spend
      : 0;
  const incrementalROAS =
    inputs.spend > 0
      ? (incrementalConversions * inputs.revenuePerConversion) / inputs.spend
      : 0;

  return {
    totalUsers: inputs.totalUsers,
    spend: inputs.spend,
    revenuePerConversion: inputs.revenuePerConversion,
    convertAnywayUsers,
    persuadableUsers,
    lostUsers,
    exposedConvertAnywayUsers,
    exposedPersuadableUsers,
    baselineConversions,
    totalConversionsWithAds,
    incrementalConversions,
    attributedConversions,
    claimedButNonIncremental,
    claimedShare,
    overstatementMultiple,
    wastedSpendEstimate,
    attributedROAS,
    incrementalROAS,
  };
};
