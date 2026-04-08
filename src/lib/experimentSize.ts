export type ExperimentSizeInputs = {
  baselineRate: number;
  relativeMde: number;
  significance: 0.9 | 0.95 | 0.99;
  power: 0.8 | 0.9;
  groups: number;
  dailyUsers: number;
  dailyConversions: number;
};

export type FeasibilityStatus =
  | "Realistic"
  | "Possible but expensive"
  | "Likely underpowered"
  | "Reconsider design";

export type ExperimentSizeOutputs = {
  baselineRate: number;
  targetRate: number;
  absoluteLift: number;
  relativeMde: number;
  significance: number;
  alpha: number;
  power: number;
  groups: number;
  sampleSizePerGroup: number;
  totalSampleSize: number;
  dailyUsersEffective: number | null;
  estimatedDurationDays: number | null;
  requiredDailyUsersFor28Days: number;
  sampleSizeRead: string;
  durationRead: string | null;
  tradeoffHints: string[];
  status: FeasibilityStatus;
  statusReason: string;
  insightHeadline: string;
  insightBody: string;
  trafficLine: string;
  tradeoffLine: string;
  benchmarkLine: string;
  groupsLine: string;
  feasibilityLine: string;
  keyInsight: string;
};

export const defaultExperimentSizeInputs: ExperimentSizeInputs = {
  baselineRate: 0.05,
  relativeMde: 0.1,
  significance: 0.95,
  power: 0.8,
  groups: 2,
  dailyUsers: 0,
  dailyConversions: 0,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const normalizeExperimentSizeInputs = (
  inputs: ExperimentSizeInputs,
): ExperimentSizeInputs => ({
  baselineRate: clamp(inputs.baselineRate, 0.001, 0.5),
  relativeMde: clamp(inputs.relativeMde, 0.01, 1.5),
  significance:
    inputs.significance === 0.9 ||
    inputs.significance === 0.95 ||
    inputs.significance === 0.99
      ? inputs.significance
      : defaultExperimentSizeInputs.significance,
  power:
    inputs.power === 0.8 || inputs.power === 0.9
      ? inputs.power
      : defaultExperimentSizeInputs.power,
  groups: Math.round(clamp(inputs.groups, 2, 6)),
  dailyUsers: clamp(inputs.dailyUsers, 0, 5_000_000),
  dailyConversions: clamp(inputs.dailyConversions, 0, 250_000),
});

const inverseNormalCdf = (probability: number) => {
  const p = clamp(probability, 1e-12, 1 - 1e-12);

  const a = [
    -39.6968302866538,
    220.946098424521,
    -275.928510446969,
    138.357751867269,
    -30.6647980661472,
    2.50662827745924,
  ];
  const b = [
    -54.4760987982241,
    161.585836858041,
    -155.698979859887,
    66.8013118877197,
    -13.2806815528857,
  ];
  const c = [
    -0.00778489400243029,
    -0.322396458041136,
    -2.40075827716184,
    -2.54973253934373,
    4.37466414146497,
    2.93816398269878,
  ];
  const d = [
    0.00778469570904146,
    0.32246712907004,
    2.445134137143,
    3.75440866190742,
  ];
  const low = 0.02425;
  const high = 1 - low;

  if (p < low) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }

  if (p > high) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }

  const q = p - 0.5;
  const r = q * q;

  return (
    (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  );
};

const getMdeBenchmark = (relativeMde: number) => {
  if (relativeMde < 0.05) {
    return "MDE below 5% is very hard to detect in practice.";
  }

  if (relativeMde < 0.1) {
    return "MDE between 5% and 10% is ambitious and usually traffic-heavy.";
  }

  if (relativeMde < 0.2) {
    return "MDE between 10% and 20% is a typical planning range.";
  }

  return "MDE above 20% is easier to power, but may be less realistic.";
};

const getGroupsGuidance = (groups: number) => {
  if (groups <= 3) {
    return "2-3 groups is a normal experimental setup.";
  }

  if (groups === 4) {
    return "4 groups is workable, but traffic needs rise quickly.";
  }

  return "5-6 groups usually slows learning substantially unless traffic is very strong.";
};

const getSignificanceGuidance = (significance: number) =>
  significance === 0.99
    ? "99% significance is stricter and materially more expensive."
    : significance === 0.95
      ? "95% significance is the standard default for most product tests."
      : "90% significance is lighter on sample size, but carries more false-positive risk.";

const getStatus = ({
  durationDays,
  groups,
  relativeMde,
  significance,
}: {
  durationDays: number | null;
  groups: number;
  relativeMde: number;
  significance: number;
}) => {
  let score = 0;

  if (relativeMde < 0.05) {
    score += 3;
  } else if (relativeMde < 0.1) {
    score += 2;
  } else if (relativeMde < 0.15) {
    score += 1;
  }

  if (groups >= 5) {
    score += 2;
  } else if (groups === 4) {
    score += 1;
  }

  if (significance === 0.99) {
    score += 1;
  }

  if (durationDays !== null) {
    if (durationDays > 84) {
      score += 3;
    } else if (durationDays > 42) {
      score += 2;
    } else if (durationDays > 21) {
      score += 1;
    }
  } else {
    score += 1;
  }

  if (score <= 1) {
    return {
      status: "Realistic" as const,
      reason: "Traffic and sensitivity look reasonable for a standard experiment.",
    };
  }

  if (score <= 3) {
    return {
      status: "Possible but expensive" as const,
      reason: "The design is workable, but it will consume meaningful traffic and time.",
    };
  }

  if (score <= 5) {
    return {
      status: "Likely underpowered" as const,
      reason: "At this sensitivity, the experiment will be hard to finish cleanly.",
    };
  }

  return {
    status: "Reconsider design" as const,
    reason: "The setup is unlikely to be a practical way to get a decision.",
  };
};

export const runExperimentSizeCalculation = (
  rawInputs: ExperimentSizeInputs,
): ExperimentSizeOutputs => {
  const inputs = normalizeExperimentSizeInputs(rawInputs);
  const alpha = 1 - inputs.significance;
  const targetRate = clamp(
    inputs.baselineRate * (1 + inputs.relativeMde),
    0.001,
    0.999,
  );
  const absoluteLift = targetRate - inputs.baselineRate;
  const pooledRate = (inputs.baselineRate + targetRate) / 2;
  const zAlpha = inverseNormalCdf(1 - alpha / 2);
  const zBeta = inverseNormalCdf(inputs.power);
  const pooledVariance = 2 * pooledRate * (1 - pooledRate);
  const unpooledVariance =
    inputs.baselineRate * (1 - inputs.baselineRate) +
    targetRate * (1 - targetRate);
  const perGroup = Math.ceil(
    Math.pow(
      zAlpha * Math.sqrt(pooledVariance) + zBeta * Math.sqrt(unpooledVariance),
      2,
    ) / Math.pow(absoluteLift, 2),
  );
  const totalSampleSize = perGroup * inputs.groups;

  const dailyUsersEffective =
    inputs.dailyUsers > 0
      ? inputs.dailyUsers
      : inputs.dailyConversions > 0
        ? inputs.dailyConversions / inputs.baselineRate
        : null;

  const estimatedDurationDays =
    dailyUsersEffective && dailyUsersEffective > 0
      ? totalSampleSize / dailyUsersEffective
      : null;

  const requiredDailyUsersFor28Days = Math.ceil(totalSampleSize / 28);
  const feasibility = getStatus({
    durationDays: estimatedDurationDays,
    groups: inputs.groups,
    relativeMde: inputs.relativeMde,
    significance: inputs.significance,
  });

  const trafficLine = estimatedDurationDays
    ? `This test is feasible in about ${Math.max(1, Math.ceil(
        estimatedDurationDays,
      ))} days at current traffic.`
    : `You would need about ${requiredDailyUsersFor28Days.toLocaleString("en-US")} users per day to finish in four weeks.`;

  const tradeoffLine =
    inputs.groups >= 5
      ? "More groups are doing most of the damage here. Fewer variants would reduce runtime fast."
      : inputs.relativeMde < 0.05
        ? "The requested lift is extremely small. A larger MDE would cut sample needs sharply."
        : inputs.relativeMde < 0.1
        ? "This is a tight MDE. Relaxing it slightly would have an outsized impact on duration."
        : "The current MDE is in a workable range. Traffic scale and group count are the main levers.";

  const sampleSizeRead =
    perGroup >= 200_000
      ? "This setup requires a very large sample size."
      : perGroup >= 75_000
        ? "This is unusually high for most teams."
        : perGroup >= 25_000
          ? "This will take meaningful traffic to run well."
          : "This looks manageable if traffic is steady.";

  const durationRead = estimatedDurationDays
    ? estimatedDurationDays >= 70
      ? "This will be difficult to run in practice."
      : estimatedDurationDays >= 35
        ? "This is a long-running test for most teams."
        : estimatedDurationDays >= 14
          ? "This is workable if traffic stays stable."
          : "This should move fast with stable traffic."
    : null;

  const tradeoffHints = [
    inputs.groups > 2
      ? "Reducing groups would lower required sample size."
      : null,
    inputs.relativeMde < 0.1
      ? "Increasing MDE would shorten test duration."
      : null,
    inputs.groups >= 4 ? "More groups require substantially more traffic." : null,
  ].filter((hint): hint is string => Boolean(hint)).slice(0, 2);

  const benchmarkLine = [
    getMdeBenchmark(inputs.relativeMde),
    getSignificanceGuidance(inputs.significance),
  ].join(" ");

  const groupsLine = `${getGroupsGuidance(inputs.groups)} More groups increase required sample size and slow down experiments.`;
  const feasibilityLine = `${feasibility.status}: ${feasibility.reason}`;

  return {
    baselineRate: inputs.baselineRate,
    targetRate,
    absoluteLift,
    relativeMde: inputs.relativeMde,
    significance: inputs.significance,
    alpha,
    power: inputs.power,
    groups: inputs.groups,
    sampleSizePerGroup: perGroup,
    totalSampleSize,
    dailyUsersEffective,
    estimatedDurationDays,
    requiredDailyUsersFor28Days,
    sampleSizeRead,
    durationRead,
    tradeoffHints,
    status: feasibility.status,
    statusReason: feasibility.reason,
    insightHeadline:
      feasibility.status === "Realistic"
        ? "This experiment looks operationally realistic."
        : feasibility.status === "Possible but expensive"
          ? "This experiment is doable, but it will cost real traffic."
          : feasibility.status === "Likely underpowered"
            ? "This setup is likely to struggle for signal."
            : "The current setup should probably be redesigned.",
    insightBody: trafficLine,
    trafficLine,
    tradeoffLine,
    benchmarkLine,
    groupsLine,
    feasibilityLine,
    keyInsight: `${feasibilityLine} ${trafficLine}`,
  };
};
