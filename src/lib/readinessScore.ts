export const READINESS_SCORE_PATH = "/incrementality-readiness";

export type ReadinessLevel =
  | "Attribution-dependent"
  | "Needs foundations"
  | "Experiment-ready"
  | "Ready to scale";

export type ReadinessDimensionKey =
  | "data"
  | "design"
  | "decision"
  | "volume"
  | "alignment";

export type ReadinessInputs = {
  monthlyConversions: number;
  monthlySpend: number;
  channels: number;
  answers: Record<string, string>;
};

export type ReadinessOption = {
  id: string;
  label: string;
  score: number;
  evidence: string;
};

export type ReadinessQuestion = {
  id: string;
  section: string;
  dimension: ReadinessDimensionKey;
  question: string;
  why: string;
  options: ReadinessOption[];
};

export type DimensionReadout = {
  key: ReadinessDimensionKey;
  label: string;
  score: number;
  status: "Strong" | "Usable" | "Weak";
  read: string;
};

export type RecommendedTestDesign = {
  name: string;
  fit: string;
  caution: string;
};

export type ReadinessBenchmark = {
  peers: string;
  usuallyCan: string;
  usuallyCannot: string;
};

export type BoardMemo = {
  headline: string;
  body: string;
  ask: string;
};

export type LimitingConstraint = {
  label: string;
  read: string;
};

export const dimensionLabels: Record<ReadinessDimensionKey, string> = {
  data: "Data foundation",
  design: "Experiment design",
  decision: "Decision discipline",
  volume: "Signal volume",
  alignment: "Organizational alignment",
};

export const frameworkDimensions: Array<{
  key: ReadinessDimensionKey;
  title: string;
  principle: string;
}> = [
  {
    key: "data",
    title: "Data foundation",
    principle:
      "The organization needs one trusted outcome source and clean campaign taxonomy before a causal result can be defended.",
  },
  {
    key: "design",
    title: "Experiment design",
    principle:
      "A credible control group and manageable noise matter more than a sophisticated dashboard.",
  },
  {
    key: "decision",
    title: "Decision discipline",
    principle:
      "Incrementality creates value only when the budget action is agreed before results arrive.",
  },
  {
    key: "volume",
    title: "Signal volume",
    principle:
      "Traffic and spend determine whether the first readout should be directional, channel-specific, or scalable.",
  },
  {
    key: "alignment",
    title: "Organizational alignment",
    principle:
      "Marketing, analytics, and finance need one primary question and one owner for the readout.",
  },
];

export const readinessQuestions: ReadinessQuestion[] = [
  {
    id: "source_of_truth",
    section: "Data foundation",
    dimension: "data",
    question: "What is the source of truth for conversions or revenue?",
    why: "Incrementality readouts fail when teams cannot agree which outcome is real.",
    options: [
      {
        id: "fragmented",
        label: "Different tools disagree and nobody owns the final number",
        score: 15,
        evidence: "No trusted conversion source of truth.",
      },
      {
        id: "analytics",
        label: "Analytics platform is used, but finance or CRM often disagrees",
        score: 45,
        evidence: "A working source exists, but reconciliation risk remains.",
      },
      {
        id: "owned",
        label: "CRM, warehouse, or finance-owned table is the final source",
        score: 90,
        evidence: "Outcome ownership is clear enough for a defensible test.",
      },
    ],
  },
  {
    id: "campaign_taxonomy",
    section: "Data foundation",
    dimension: "data",
    question: "How clean is campaign and channel taxonomy?",
    why: "Messy naming makes it hard to isolate what changed during a test.",
    options: [
      {
        id: "messy",
        label: "Naming is inconsistent across channels and teams",
        score: 20,
        evidence: "Campaign taxonomy would create analysis cleanup risk.",
      },
      {
        id: "partial",
        label: "Core paid channels are mostly standardized",
        score: 62,
        evidence: "Taxonomy is usable for a focused first test.",
      },
      {
        id: "governed",
        label: "Naming rules are documented and enforced before launch",
        score: 92,
        evidence: "Campaign taxonomy is governed enough for repeatable measurement.",
      },
    ],
  },
  {
    id: "metric_hierarchy",
    section: "Data foundation",
    dimension: "data",
    question: "Is there a clear metric hierarchy for the readout?",
    why: "A test needs one primary metric and guardrails, otherwise every team can pick its preferred result.",
    options: [
      {
        id: "unclear",
        label: "Primary and guardrail metrics are not separated",
        score: 24,
        evidence: "Metric hierarchy is unclear.",
      },
      {
        id: "mostly",
        label: "Primary metric exists, but guardrails are informal",
        score: 64,
        evidence: "Metric hierarchy is usable but incomplete.",
      },
      {
        id: "documented",
        label: "Primary metric, guardrails, and exclusions are documented",
        score: 94,
        evidence: "Metric hierarchy can support a clean readout.",
      },
    ],
  },
  {
    id: "test_unit",
    section: "Experiment design",
    dimension: "design",
    question: "Can you create a real control group?",
    why: "A causal readout needs a credible untreated comparison, not just before/after reporting.",
    options: [
      {
        id: "none",
        label: "No, platforms and stakeholders require all audiences to be active",
        score: 18,
        evidence: "No practical control group is available yet.",
      },
      {
        id: "platform",
        label: "Yes, inside some ad platforms or lifecycle channels",
        score: 62,
        evidence: "Platform-level holdouts are feasible for a narrow readout.",
      },
      {
        id: "geo_or_user",
        label: "Yes, via geo split, user holdout, or matched-market design",
        score: 92,
        evidence: "A credible experimental unit is available.",
      },
    ],
  },
  {
    id: "noise_control",
    section: "Experiment design",
    dimension: "design",
    question: "How much launch, promo, or seasonality noise is expected?",
    why: "Noise can be larger than the treatment effect and make the readout unusable.",
    options: [
      {
        id: "high",
        label: "Major promos, launches, or seasonal swings overlap the test window",
        score: 28,
        evidence: "External noise may overpower the signal.",
      },
      {
        id: "medium",
        label: "Some noise exists, but timing can be controlled",
        score: 66,
        evidence: "Noise is manageable with careful timing and guardrails.",
      },
      {
        id: "low",
        label: "Demand is stable enough to isolate a campaign change",
        score: 88,
        evidence: "The calendar is stable enough for a clean readout.",
      },
    ],
  },
  {
    id: "spend_concentration",
    section: "Experiment design",
    dimension: "design",
    question: "Where is media spend concentrated?",
    why: "A first test works best when one channel or market has enough spend to create a measurable change.",
    options: [
      {
        id: "scattered",
        label: "Spend is scattered across many small channels",
        score: 34,
        evidence: "Spend fragmentation makes a measurable treatment harder.",
      },
      {
        id: "some_focus",
        label: "One or two channels are large enough to test",
        score: 72,
        evidence: "Spend concentration supports a focused readout.",
      },
      {
        id: "clear_focus",
        label: "One priority channel or market can absorb a clean test",
        score: 92,
        evidence: "Spend concentration supports a strong first test.",
      },
    ],
  },
  {
    id: "decision_rule",
    section: "Decision discipline",
    dimension: "decision",
    question: "What happens if the test result is negative or inconclusive?",
    why: "If the decision rule is not agreed in advance, results become politics.",
    options: [
      {
        id: "unknown",
        label: "The team will discuss it after seeing the result",
        score: 18,
        evidence: "No pre-registered decision rule.",
      },
      {
        id: "directional",
        label: "There is a directional rule, but thresholds are not explicit",
        score: 58,
        evidence: "Decision discipline exists, but thresholds need tightening.",
      },
      {
        id: "explicit",
        label: "Budget actions and thresholds are agreed before launch",
        score: 95,
        evidence: "Results can change budget decisions without post-hoc debate.",
      },
    ],
  },
  {
    id: "attribution_authority",
    section: "Decision discipline",
    dimension: "decision",
    question: "Can incrementality override platform attribution?",
    why: "The organization is not ready if causal evidence loses to dashboard ROAS by default.",
    options: [
      {
        id: "no",
        label: "No, platform ROAS still decides budget",
        score: 22,
        evidence: "Attribution still has final budget authority.",
      },
      {
        id: "sometimes",
        label: "Sometimes, for selected channels or executive reviews",
        score: 64,
        evidence: "Incrementality can influence some decisions.",
      },
      {
        id: "yes",
        label: "Yes, lift evidence is the preferred budget standard",
        score: 94,
        evidence: "Causal evidence can override attribution reports.",
      },
    ],
  },
  {
    id: "finance_alignment",
    section: "Decision discipline",
    dimension: "decision",
    question: "Will finance accept the result as budget evidence?",
    why: "Incrementality only becomes strategic when the result can survive finance scrutiny.",
    options: [
      {
        id: "no",
        label: "Finance is not involved in measurement decisions",
        score: 24,
        evidence: "Finance is not aligned to use the readout.",
      },
      {
        id: "review",
        label: "Finance reviews results but does not define the rule",
        score: 64,
        evidence: "Finance alignment is partial.",
      },
      {
        id: "yes",
        label: "Finance agrees on the metric and decision rule upfront",
        score: 96,
        evidence: "Finance can accept the result as budget evidence.",
      },
    ],
  },
  {
    id: "owner",
    section: "Organizational alignment",
    dimension: "alignment",
    question: "Who owns the measurement readout?",
    why: "Tests need one accountable owner across marketing, analytics, and finance.",
    options: [
      {
        id: "unclear",
        label: "Ownership is unclear or split across teams",
        score: 24,
        evidence: "Readout ownership is ambiguous.",
      },
      {
        id: "marketing",
        label: "Marketing owns it, with analytics support",
        score: 62,
        evidence: "Ownership exists, but independence may be limited.",
      },
      {
        id: "cross_functional",
        label: "Marketing, analytics, and finance agree on ownership",
        score: 92,
        evidence: "Cross-functional ownership supports a credible readout.",
      },
    ],
  },
  {
    id: "stakeholder_buy_in",
    section: "Organizational alignment",
    dimension: "alignment",
    question: "Are stakeholders aligned on the question being answered?",
    why: "A test cannot answer every question. Misalignment creates disappointed readers.",
    options: [
      {
        id: "unclear",
        label: "Different teams want different answers from the same test",
        score: 24,
        evidence: "The diagnostic question is not aligned.",
      },
      {
        id: "mostly",
        label: "The main question is clear, but secondary asks keep changing",
        score: 66,
        evidence: "The question is usable but needs scope control.",
      },
      {
        id: "clear",
        label: "One primary question and guardrail metrics are agreed",
        score: 94,
        evidence: "Stakeholders are aligned on what the test should decide.",
      },
    ],
  },
];

export const defaultReadinessInputs: ReadinessInputs = {
  monthlyConversions: 1200,
  monthlySpend: 85000,
  channels: 5,
  answers: Object.fromEntries(
    readinessQuestions.map((question) => [question.id, question.options[1].id]),
  ),
};

const getVolumeScore = (inputs: ReadinessInputs) => {
  const conversionScore =
    inputs.monthlyConversions >= 10000
      ? 100
      : inputs.monthlyConversions >= 5000
        ? 90
        : inputs.monthlyConversions >= 1500
          ? 78
          : inputs.monthlyConversions >= 500
            ? 58
            : inputs.monthlyConversions >= 150
              ? 38
              : inputs.monthlyConversions >= 50
                ? 24
                : 8;

  const spendScore =
    inputs.monthlySpend >= 250000
      ? 100
      : inputs.monthlySpend >= 75000
        ? 78
        : inputs.monthlySpend >= 25000
          ? 58
          : inputs.monthlySpend >= 7500
            ? 36
            : 18;

  const channelScore =
    inputs.channels >= 4 ? 82 : inputs.channels >= 2 ? 64 : 42;

  return Math.round(conversionScore * 0.62 + spendScore * 0.26 + channelScore * 0.12);
};

const getSignalCap = (inputs: ReadinessInputs) => {
  if (inputs.monthlyConversions < 25) {
    return 34;
  }

  if (inputs.monthlyConversions < 50) {
    return 40;
  }

  if (inputs.monthlyConversions < 150) {
    return 48;
  }

  if (inputs.monthlyConversions < 500) {
    return 60;
  }

  if (inputs.monthlyConversions < 1500) {
    return 74;
  }

  return 100;
};

const getLimitingConstraints = (inputs: ReadinessInputs): LimitingConstraint[] => {
  const constraints: LimitingConstraint[] = [];

  if (inputs.monthlyConversions < 25) {
    constraints.push({
      label: "Extremely low conversion signal",
      read: "With fewer than 25 conversions per month, most lift tests will be too noisy for budget decisions.",
    });
  } else if (inputs.monthlyConversions < 150) {
    constraints.push({
      label: "Low conversion signal",
      read: "Conversion volume is likely too thin for anything beyond directional or diagnostic testing.",
    });
  } else if (inputs.monthlyConversions < 500) {
    constraints.push({
      label: "Limited conversion signal",
      read: "A narrow holdout may be possible, but broad geo or multi-channel testing is likely underpowered.",
    });
  }

  if (inputs.monthlySpend < 7500) {
    constraints.push({
      label: "Low media spend",
      read: "Treatment changes may be too small to separate from normal business noise.",
    });
  }

  return constraints;
};

const getSelectedOption = (question: ReadinessQuestion, answerId: string) =>
  question.options.find((option) => option.id === answerId) ?? question.options[0];

const getDimensionStatus = (score: number): DimensionReadout["status"] => {
  if (score >= 75) {
    return "Strong";
  }

  if (score >= 52) {
    return "Usable";
  }

  return "Weak";
};

export const evaluateReadiness = (inputs: ReadinessInputs) => {
  const evidence = readinessQuestions.map((question) => ({
    question,
    option: getSelectedOption(question, inputs.answers[question.id]),
  }));
  const answer = (questionId: string) =>
    evidence.find((item) => item.question.id === questionId)?.option.id;

  const volumeScore = getVolumeScore(inputs);
  const signalCap = getSignalCap(inputs);
  const limitingConstraints = getLimitingConstraints(inputs);
  const dimensionScores = (Object.keys(dimensionLabels) as ReadinessDimensionKey[])
    .map((key) => {
      if (key === "volume") {
        return {
          key,
          label: dimensionLabels[key],
          score: volumeScore,
          status: getDimensionStatus(volumeScore),
          read:
            inputs.monthlyConversions < 50
              ? "Too little conversion signal for a reliable lift test."
              : inputs.monthlyConversions < 150
                ? "Signal is very thin; use diagnostics before budget tests."
                : volumeScore >= 75
              ? "Enough signal for a credible first readout."
              : volumeScore >= 52
                ? "Enough signal for directional testing if the design is narrow."
                : "Signal is thin; start with smaller-risk diagnostics.",
        };
      }

      const dimensionEvidence = evidence.filter(
        (item) => item.question.dimension === key,
      );
      const score = Math.round(
        dimensionEvidence.reduce((total, item) => total + item.option.score, 0) /
          dimensionEvidence.length,
      );

      return {
        key,
        label: dimensionLabels[key],
        score,
        status: getDimensionStatus(score),
        read:
          score >= 75
            ? "This foundation can support a defensible readout."
            : score >= 52
              ? "Usable for a focused test, but needs scope control."
              : "This is likely to block trust in the result.",
      };
    })
    .sort((a, b) => a.score - b.score);

  const rawScore = Math.round(
    dimensionScores.reduce((total, dimension) => {
      const weight =
        dimension.key === "data"
          ? 0.24
          : dimension.key === "design"
            ? 0.22
            : dimension.key === "decision"
              ? 0.22
              : dimension.key === "volume"
                ? 0.18
                : 0.14;

      return total + dimension.score * weight;
    }, 0),
  );
  const weightedScore = Math.min(rawScore, signalCap);

  const level: ReadinessLevel =
    weightedScore >= 82
      ? "Ready to scale"
      : weightedScore >= 66
        ? "Experiment-ready"
        : weightedScore >= 46
          ? "Needs foundations"
          : "Attribution-dependent";

  const blocker = dimensionScores[0];
  const canTestNow =
    inputs.monthlyConversions < 50
      ? "Do not run an incrementality test yet. Use analytics QA, attribution-bias review, and event-volume growth first."
      : inputs.monthlyConversions < 150
        ? "Only a directional platform holdout or diagnostic audit is realistic at this volume."
        : blocker.score >= 66
      ? "A controlled lift test can be planned now if the decision rule is documented before launch."
      : blocker.key === "volume"
        ? "Run an attribution-bias audit or platform holdout before attempting a large geo test."
        : `Do not launch a major lift test until ${blocker.label.toLowerCase()} is tightened.`;

  const notYet =
    inputs.monthlyConversions < 150
      ? "Do not use this setup for geo tests, multi-channel incrementality claims, or high-stakes budget reallocation."
      : blocker.score >= 66
      ? "Avoid broad multi-channel readouts until one repeatable test motion has been proven."
      : "Avoid using this score as permission to make a large budget move without fixing the blocker first.";

  const primaryRecommendation =
    level === "Ready to scale"
      ? "Turn the current capability into a quarterly measurement roadmap with budget rules by channel."
      : level === "Experiment-ready"
        ? "Run one focused incrementality test and publish the decision rule before results arrive."
        : level === "Needs foundations"
          ? `Fix ${blocker.label.toLowerCase()} first, then run a narrow pilot where the control group is defensible.`
          : "Treat platform attribution as directional reporting only and start with measurement foundations.";

  const benchmark: ReadinessBenchmark =
    level === "Ready to scale"
      ? {
          peers:
            "Comparable teams usually have governed data, explicit decision rules, and repeatable lift readouts.",
          usuallyCan:
            "Plan quarterly tests across priority channels and use results in budget allocation.",
          usuallyCannot:
            "Assume every channel result generalizes without local design checks.",
        }
      : level === "Experiment-ready"
        ? {
            peers:
              "Comparable teams can run one focused test, but still need tight scope and executive agreement.",
            usuallyCan:
              "Answer a narrow budget question with a pre-registered readout.",
            usuallyCannot:
              "Use one test as a full measurement operating system.",
          }
        : level === "Needs foundations"
          ? {
              peers:
                "Comparable teams have enough signal to start, but the readout is vulnerable to trust gaps.",
              usuallyCan:
                "Run a pilot after fixing the primary blocker.",
              usuallyCannot:
                "Make a high-stakes budget shift from platform attribution or a noisy pre/post read.",
            }
          : {
              peers:
                "Comparable teams are still reporting-led and usually confuse attribution with causality.",
              usuallyCan:
                "Run a measurement foundation audit and pick one narrow causal question.",
              usuallyCannot:
                "Defend a major incrementality claim to finance or executives.",
            };

  const recommendedDesign: RecommendedTestDesign =
    inputs.monthlyConversions < 50
      ? {
          name: "Signal-building measurement audit",
          fit: "Monthly conversion volume is too low for a credible lift readout. The right first step is to improve event volume, tracking quality, and channel diagnostics.",
          caution:
            "A low-volume lift test can produce a confident-looking answer that is mostly noise.",
        }
      : answer("source_of_truth") === "fragmented" ||
    answer("campaign_taxonomy") === "messy" ||
    answer("metric_hierarchy") === "unclear" ||
    answer("owner") === "unclear"
      ? {
          name: "Measurement foundation audit",
          fit: "The first useful readout is not a lift test. It is a cleanup audit that proves the team can trust outcomes, taxonomy, and readout ownership.",
          caution:
            "Do not use a weak causal design to make a large budget call until the data and owner are defensible.",
        }
      : answer("test_unit") === "geo_or_user" &&
          answer("noise_control") !== "high" &&
          answer("spend_concentration") !== "scattered" &&
          inputs.monthlyConversions >= 1500 &&
          inputs.channels >= 4
        ? {
            name: "Geo or matched-market lift test",
            fit: "A credible experimental unit, manageable noise, and enough signal make this the strongest first budget readout.",
            caution:
              "Keep promos, launches, and large site changes out of the test window.",
          }
        : answer("test_unit") === "platform" &&
            answer("decision_rule") !== "unknown"
          ? {
              name: "Platform holdout with pre-registered rule",
              fit: "A platform-level control group is available and the decision process is mature enough for a narrow causal readout.",
              caution:
                "Treat the result as channel-specific until it is replicated outside the platform.",
            }
          : blocker.key === "volume" || inputs.monthlyConversions < 500
        ? {
            name: "Platform holdout or directional lift test",
            fit: "Signal is limited, so start where randomization is easy and the budget question is narrow.",
            caution: "Avoid broad geo testing until conversion volume improves.",
          }
        : {
            name: "Single-channel holdout",
            fit: "A focused holdout can answer one practical budget question without overloading the organization.",
            caution: "Do not generalize the result across every channel yet.",
          };

  const boardMemo: BoardMemo = {
    headline:
      level === "Ready to scale"
        ? "Incrementality can become a quarterly budget planning system."
        : level === "Experiment-ready"
          ? "The team is ready for one focused causal readout."
          : level === "Needs foundations"
            ? "A lift test is possible after the primary blocker is repaired."
            : "The team is not ready to use attribution as budget truth.",
    body:
      `Current readiness is ${weightedScore}/100. The primary constraint is ${blocker.label.toLowerCase()}, and the recommended first design is ${recommendedDesign.name}.`,
    ask:
      blocker.score < 66
        ? `Approve a foundation fix for ${blocker.label.toLowerCase()} before launching a high-stakes test.`
        : "Approve one pre-registered pilot with a clear budget action before results are reviewed.",
  };

  const clientReadyReport = [
    `${level}: ${boardMemo.headline}`,
    `Main constraint: ${blocker.label}.`,
    `Recommended path: ${recommendedDesign.name}.`,
    `Executive ask: ${boardMemo.ask}`,
  ];

  const roadmap = [
    blocker.score < 66
      ? `Repair the weakest foundation: ${blocker.label}.`
      : "Write the causal question, primary metric, and budget action in one page.",
    "Choose the smallest test design that can answer one real budget question.",
    level === "Ready to scale"
      ? "Create a quarterly readout calendar across priority channels."
      : "Run a pilot readout and review whether the decision rule survived stakeholder pressure.",
  ];

  return {
    score: weightedScore,
    level,
    blocker,
    canTestNow,
    notYet,
    primaryRecommendation,
    recommendedDesign,
    benchmark,
    boardMemo,
    clientReadyReport,
    roadmap,
    rawScore,
    signalCap,
    limitingConstraints,
    dimensionScores,
    evidence,
  };
};

export const formatReadinessReport = (inputs: ReadinessInputs) => {
  const result = evaluateReadiness(inputs);

  return [
    "Incrementality Readiness Audit",
    "",
    `Score: ${result.score}/100`,
    `Level: ${result.level}`,
    `Primary blocker: ${result.blocker.label} (${result.blocker.score}/100)`,
    `Monthly conversions: ${inputs.monthlyConversions.toLocaleString("en-US")}`,
    `Monthly media spend: $${inputs.monthlySpend.toLocaleString("en-US")}`,
    `Active paid channels: ${inputs.channels}`,
    ...(result.limitingConstraints.length > 0
      ? [
          "",
          "Hard constraints:",
          ...result.limitingConstraints.map(
            (constraint) => `- ${constraint.label}: ${constraint.read}`,
          ),
        ]
      : []),
    "",
    "What you can test now:",
    result.canTestNow,
    "",
    "What not to test yet:",
    result.notYet,
    "",
    "Primary recommendation:",
    result.primaryRecommendation,
    "",
    "Recommended test design:",
    `${result.recommendedDesign.name}: ${result.recommendedDesign.fit}`,
    `Caution: ${result.recommendedDesign.caution}`,
    "",
    "Board-ready memo:",
    result.boardMemo.headline,
    result.boardMemo.body,
    `Ask: ${result.boardMemo.ask}`,
    "",
    "Client-ready report:",
    ...result.clientReadyReport.map((item) => `- ${item}`),
    "",
    "Benchmark framing:",
    result.benchmark.peers,
    `Usually can: ${result.benchmark.usuallyCan}`,
    `Usually cannot: ${result.benchmark.usuallyCannot}`,
    "",
    "30-day roadmap:",
    ...result.roadmap.map((item) => `- ${item}`),
    "",
    "Evidence trail:",
    ...result.evidence.map(
      (item) => `- ${item.question.question} ${item.option.evidence}`,
    ),
  ].join("\n");
};

const numericParamMap = {
  monthlyConversions: "conv",
  monthlySpend: "spend",
  channels: "channels",
} as const;

const readNumber = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const readReadinessFromUrl = (
  defaults: ReadinessInputs = defaultReadinessInputs,
) => {
  if (typeof window === "undefined") {
    return { inputs: defaults, hasQueryParams: false };
  }

  const params = new URLSearchParams(window.location.search);
  const hasQueryParams = Array.from(params.keys()).length > 0;

  if (!hasQueryParams) {
    return { inputs: defaults, hasQueryParams: false };
  }

  const answers = { ...defaults.answers };

  readinessQuestions.forEach((question) => {
    const value = params.get(question.id);
    if (question.options.some((option) => option.id === value)) {
      answers[question.id] = value as string;
    }
  });

  return {
    hasQueryParams,
    inputs: {
      monthlyConversions: readNumber(
        params.get(numericParamMap.monthlyConversions),
        defaults.monthlyConversions,
      ),
      monthlySpend: readNumber(
        params.get(numericParamMap.monthlySpend),
        defaults.monthlySpend,
      ),
      channels: readNumber(params.get(numericParamMap.channels), defaults.channels),
      answers,
    },
  };
};

const buildReadinessParams = (inputs: ReadinessInputs) => {
  const params = new URLSearchParams();

  params.set(
    numericParamMap.monthlyConversions,
    String(Math.round(inputs.monthlyConversions)),
  );
  params.set(numericParamMap.monthlySpend, String(Math.round(inputs.monthlySpend)));
  params.set(numericParamMap.channels, String(Math.round(inputs.channels)));

  readinessQuestions.forEach((question) => {
    params.set(question.id, inputs.answers[question.id]);
  });

  return params;
};

export const writeReadinessToUrl = (inputs: ReadinessInputs) => {
  if (typeof window === "undefined") {
    return;
  }

  window.history.replaceState(
    {},
    "",
    `${READINESS_SCORE_PATH}?${buildReadinessParams(inputs).toString()}`,
  );
};

export const getCanonicalReadinessUrl = (inputs: ReadinessInputs) => {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://lab.mzhirnov.com";

  return `${origin}${READINESS_SCORE_PATH}?${buildReadinessParams(inputs).toString()}`;
};

export const isDefaultReadinessState = (
  inputs: ReadinessInputs,
  defaults: ReadinessInputs = defaultReadinessInputs,
) =>
  inputs.monthlyConversions === defaults.monthlyConversions &&
  inputs.monthlySpend === defaults.monthlySpend &&
  inputs.channels === defaults.channels &&
  readinessQuestions.every(
    (question) => inputs.answers[question.id] === defaults.answers[question.id],
  );
