export const YANDEX_METRIKA_ID = 108434175;

export const analyticsGoals = {
  sharedScenarioOpened: "shared_scenario_opened",
  scenarioAdjusted: "scenario_adjusted",
  currencyChanged: "currency_changed",
  defaultsReset: "defaults_reset",
  shareLinkCopied: "share_link_copied",
  insightTextCopied: "insight_text_copied",
  snapshotDownloaded: "snapshot_downloaded",
  experimentSizeScenarioAdjusted: "experiment_size_scenario_adjusted",
  experimentSizeShareLinkCopied: "experiment_size_share_link_copied",
  experimentSizeInsightCopied: "experiment_size_insight_copied",
  experimentSizeSnapshotDownloaded: "experiment_size_snapshot_downloaded",
  utmBuilderAdjusted: "utm_builder_adjusted",
  utmBuilderUrlCopied: "utm_builder_url_copied",
  utmBuilderParamsCopied: "utm_builder_params_copied",
} as const;

declare global {
  interface Window {
    ym?: (
      id: number,
      action: "init" | "reachGoal",
      target: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

export const trackGoal = (
  goal: (typeof analyticsGoals)[keyof typeof analyticsGoals],
  params?: Record<string, unknown>,
) => {
  if (typeof window === "undefined" || typeof window.ym !== "function") {
    return;
  }

  window.ym(YANDEX_METRIKA_ID, "reachGoal", goal, params);
};
