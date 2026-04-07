import type { Formatters } from "./format";
import type { SimulationOutputs } from "./simulation";

export const scenarioName = "Retargeting experiment";

type MessagingMode = "ui" | "snapshot";
type ToneLevel = "minimal" | "moderate" | "strong" | "severe" | "extreme";
type ClaimLevel = "low" | "moderate" | "high" | "very_high";
type EconomicsLevel = "weak" | "fragile" | "viable" | "healthy";

export type MessagingContent = {
  contextLabel: string;
  headline: string;
  supportingLine: string;
  moneyLine: string;
  gapLine: string;
  explicitGapMetric: string;
  toneLevel: ToneLevel;
};

export type InsightContent = {
  ui: MessagingContent;
  snapshot: MessagingContent;
  snapshotFooter: string;
  textExport: string;
};

type BuildMessagingArgs = {
  outputs: SimulationOutputs;
  formatters: Formatters;
};

const getToneLevel = (overstatementMultiple: number): ToneLevel => {
  if (overstatementMultiple < 1.25) {
    return "minimal";
  }

  if (overstatementMultiple < 2) {
    return "moderate";
  }

  if (overstatementMultiple < 4) {
    return "strong";
  }

  if (overstatementMultiple < 8) {
    return "severe";
  }

  return "extreme";
};

const getClaimLevel = (claimedShare: number): ClaimLevel => {
  if (claimedShare < 0.2) {
    return "low";
  }

  if (claimedShare < 0.5) {
    return "moderate";
  }

  if (claimedShare < 0.75) {
    return "high";
  }

  return "very_high";
};

const getEconomicsLevel = (incrementalROAS: number): EconomicsLevel => {
  if (incrementalROAS < 1) {
    return "weak";
  }

  if (incrementalROAS < 1.5) {
    return "fragile";
  }

  if (incrementalROAS < 3) {
    return "viable";
  }

  return "healthy";
};

const buildHeadline = (
  outputs: SimulationOutputs,
  formatters: Formatters,
  toneLevel: ToneLevel,
  claimLevel: ClaimLevel,
) => {
  if (toneLevel === "minimal") {
    return "Reported and incremental performance are relatively close";
  }

  if (toneLevel === "moderate") {
    return claimLevel === "moderate"
      ? "Retargeting is claiming more than it creates"
      : "Reported performance is above incremental reality";
  }

  if (toneLevel === "strong") {
    return "Reported performance is materially above incremental reality";
  }

  return `Retargeting overstates performance by ${formatters.multiple(
    outputs.overstatementMultiple,
  )}`;
};

const supportingCopy: Record<
  ToneLevel,
  { ui: string; snapshot: string }
> = {
  minimal: {
    ui: "In this scenario, reporting and incremental performance remain relatively aligned.",
    snapshot: "Reporting and incremental performance are relatively aligned.",
  },
  moderate: {
    ui: "The campaign creates some lift, but reporting still overstates its true impact.",
    snapshot: "The campaign creates lift, but reporting still overstates its impact.",
  },
  strong: {
    ui: "A meaningful share of reported performance would likely happen without ads.",
    snapshot: "A meaningful share of reported performance would likely happen anyway.",
  },
  severe: {
    ui: "Most reported performance is captured demand rather than new growth.",
    snapshot: "Most reported performance is captured demand, not new growth.",
  },
  extreme: {
    ui: "Reported performance exceeds incremental reality by a wide margin in this scenario.",
    snapshot: "Reported performance is far above incremental reality.",
  },
};

const buildMoneyLine = (
  outputs: SimulationOutputs,
  formatters: Formatters,
  mode: MessagingMode,
  economicsLevel: EconomicsLevel,
) => {
  if (mode === "snapshot") {
    if (economicsLevel === "weak") {
      return `Reported performance suggests ${formatters.roasExplanation(
        outputs.attributedROAS,
      )}. Incremental reality is ${formatters.roasExplanation(
        outputs.incrementalROAS,
      )}.`;
    }

    return `Reported performance suggests ${formatters.roasExplanation(
      outputs.attributedROAS,
    )}. Incremental reality is ${formatters.roasExplanation(
      outputs.incrementalROAS,
    )}.`;
  }

  if (economicsLevel === "weak") {
    return `Reported performance suggests ${formatters.roasExplanation(
      outputs.attributedROAS,
    )}, but incremental economics are only ${formatters.roasExplanation(
      outputs.incrementalROAS,
    )}.`;
  }

  return `Reported performance suggests ${formatters.roasExplanation(
    outputs.attributedROAS,
  )}. Incremental reality is ${formatters.roasExplanation(
    outputs.incrementalROAS,
  )}.`;
};

const buildGapLine = (
  outputs: SimulationOutputs,
  formatters: Formatters,
  mode: MessagingMode,
  claimLevel: ClaimLevel,
) => {
  if (claimLevel === "low") {
    return mode === "snapshot"
      ? "A smaller share of conversions would likely happen without ads"
      : "A smaller share of reported conversions would likely happen without ads.";
  }

  if (claimLevel === "moderate") {
    return mode === "snapshot"
      ? "A meaningful share of conversions would likely happen anyway"
      : "A meaningful share of reported conversions would likely happen anyway.";
  }

  return `${formatters.percent(outputs.claimedShare)} of conversions were not caused by ads`;
};

const buildExplicitGapMetric = (
  outputs: SimulationOutputs,
  formatters: Formatters,
  claimLevel: ClaimLevel,
) =>
  claimLevel === "high" || claimLevel === "very_high"
    ? `Only ${formatters.percent(
        1 - outputs.claimedShare,
      )} of reported conversions are incremental`
    : `+${formatters.count(
        outputs.claimedButNonIncremental,
      )} conversions claimed, not created`;

const buildMessagingForMode = (
  outputs: SimulationOutputs,
  formatters: Formatters,
  mode: MessagingMode,
): MessagingContent => {
  const toneLevel = getToneLevel(outputs.overstatementMultiple);
  const claimLevel = getClaimLevel(outputs.claimedShare);
  const economicsLevel = getEconomicsLevel(outputs.incrementalROAS);

  return {
    contextLabel:
      toneLevel === "minimal"
        ? "Reported vs Real Impact"
        : "Attribution vs Incrementality",
    headline: buildHeadline(outputs, formatters, toneLevel, claimLevel),
    supportingLine: supportingCopy[toneLevel][mode],
    moneyLine: buildMoneyLine(outputs, formatters, mode, economicsLevel),
    gapLine: buildGapLine(outputs, formatters, mode, claimLevel),
    explicitGapMetric: buildExplicitGapMetric(outputs, formatters, claimLevel),
    toneLevel,
  };
};

export const generateSnapshotMessaging = ({
  outputs,
  formatters,
}: BuildMessagingArgs): InsightContent => {
  const ui = buildMessagingForMode(outputs, formatters, "ui");
  const snapshot = buildMessagingForMode(outputs, formatters, "snapshot");

  const textExport = [
    scenarioName,
    "",
    snapshot.headline,
    snapshot.supportingLine,
    snapshot.moneyLine,
    "",
    "Reported performance:",
    `${formatters.count(outputs.attributedConversions)} attributed conversions`,
    `ROAS: ${formatters.roas(outputs.attributedROAS)} (${formatters.roasExplanation(
      outputs.attributedROAS,
    )})`,
    "",
    "Incremental reality:",
    `${formatters.count(outputs.incrementalConversions)} incremental conversions`,
    `ROAS: ${formatters.roas(outputs.incrementalROAS)} (${formatters.roasExplanation(
      outputs.incrementalROAS,
    )})`,
    "",
    `${snapshot.gapLine}.`,
  ].join("\n");

  return {
    ui,
    snapshot,
    snapshotFooter: "Incrementality Lab • lab.mzhirnov.com",
    textExport,
  };
};
