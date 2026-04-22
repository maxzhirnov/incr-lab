import { Link } from "react-router-dom";
import { EXPERIMENT_SIZE_TOOL_PATH } from "../lib/experimentSizeUrlState";
import { UTM_BUILDER_PATH } from "../lib/utmBuilder";
import { TOOL_PATH } from "../lib/urlState";

const currentTools = [
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
        <h1>Interactive tools to understand real marketing impact</h1>
        <p>
          A focused set of simulations for understanding where reported
          performance diverges from real business impact.
        </p>
      </section>

      <section className="home-tools">
        <div className="home-tools__header">
          <h2>Current tools</h2>
          <p>
            A growing set of productized workflows for attribution,
            experimentation, and measurement.
          </p>
        </div>

        <div className="home-tools__grid">
          {currentTools.map((tool) => (
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
