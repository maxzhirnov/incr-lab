import { Link } from "react-router-dom";
import { EXPERIMENT_SIZE_TOOL_PATH } from "../lib/experimentSizeUrlState";
import { READINESS_FRAMEWORK_PATH, READINESS_SCORE_PATH } from "../lib/readinessScore";
import { UTM_BUILDER_PATH } from "../lib/utmBuilder";
import { TOOL_PATH } from "../lib/urlState";

const utilityTools = [
  {
    category: "Measurement Strategy",
    name: "Incrementality Readiness Score",
    description:
      "A guided diagnostic that turns the framework into a readiness score, blocker, and next testing move.",
    cta: "Run diagnostic",
    to: READINESS_SCORE_PATH,
  },
  {
    category: "Attribution",
    name: "Retargeting simulation",
    description:
      "Understand how much of your reported retargeting performance is actually incremental, not just claimed by attribution.",
    cta: "Open tool",
    to: TOOL_PATH,
  },
  {
    category: "Experiment Design",
    name: "Experiment size calculator",
    description:
      "Estimate the sample size, test duration, and detectable lift you need before committing to an experiment design.",
    cta: "Open tool",
    to: EXPERIMENT_SIZE_TOOL_PATH,
  },
  {
    category: "Campaign Operations",
    name: "UTM builder",
    description:
      "Create clean campaign links with instant validation, consistent naming, and one-click copying.",
    cta: "Build UTM link",
    to: UTM_BUILDER_PATH,
  },
];

const upcomingTools = [
  {
    category: "Measurement",
    name: "Experiment diagnostics",
    description:
      "Understand why a test is underpowered, inconclusive, or unlikely to reach significance before results are misread.",
  },
  {
    category: "Attribution",
    name: "Channel overlap mapper",
    description:
      "See where multiple channels are claiming the same conversions and where attribution starts to overstate impact.",
  },
  {
    category: "Measurement",
    name: "Lift readout",
    description:
      "Turn raw experiment outcomes into a clearer read on incremental revenue, efficiency, and decision confidence.",
  },
];

export function HomePage() {
  return (
    <main className="home-shell">
      <section className="home-hero">
        <span className="eyebrow">Incrementality Lab</span>
        <h1>A practical framework for trusting incrementality decisions</h1>
        <p>
          Diagnose whether a team has enough signal, governance, and decision
          clarity to run tests that can actually change budget allocation.
        </p>
        <div className="home-hero__actions">
          <Link className="tool-card__cta" to={READINESS_FRAMEWORK_PATH}>
            Read the framework
          </Link>
          <Link className="ghost-button hero-action" to={READINESS_SCORE_PATH}>
            Run readiness score
          </Link>
        </div>
      </section>

      <section className="home-featured">
        <div className="home-featured__copy">
          <span className="eyebrow">Featured framework</span>
          <h2>Incrementality Readiness Framework</h2>
          <p>
            A five-dimension model for separating teams that are ready for
            causal measurement from teams that first need stronger data,
            decision rules, or experimental constraints.
          </p>
        </div>
        <div className="home-featured__grid" aria-label="Framework dimensions">
          <article>
            <strong>Data foundation</strong>
            <span>Enough clean conversion signal to read a test.</span>
          </article>
          <article>
            <strong>Experiment design</strong>
            <span>A feasible holdout, geo split, or switchback path.</span>
          </article>
          <article>
            <strong>Decision governance</strong>
            <span>Agreement on what changes if the result is clear.</span>
          </article>
          <article>
            <strong>Business actionability</strong>
            <span>Budget and planning cycles that can absorb the answer.</span>
          </article>
        </div>
      </section>

      <section className="home-tools">
        <div className="home-tools__header">
          <h2>Tools</h2>
          <p>
            Focused workflows that turn measurement thinking into usable
            decisions.
          </p>
        </div>

        <div className="home-tools__grid">
          {utilityTools.map((tool) => (
            <Link className="tool-card" key={tool.name} to={tool.to}>
              <div className="tool-card__content">
                <div className="tool-card__meta">
                  <span className="eyebrow">{tool.category}</span>
                </div>
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
              </div>
              <span className="tool-card__cta">{tool.cta}</span>
            </Link>
          ))}

          {upcomingTools.map((tool) => (
            <article
              aria-label={`${tool.name} coming soon`}
              className="tool-card tool-card--coming-soon"
              key={tool.name}
            >
              <div className="tool-card__content">
                <div className="tool-card__meta">
                  <span className="eyebrow">{tool.category}</span>
                  <span className="tool-card__status">Coming soon</span>
                </div>
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
              </div>
              <span
                aria-disabled="true"
                className="tool-card__cta tool-card__cta--disabled"
              >
                Coming soon
              </span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
