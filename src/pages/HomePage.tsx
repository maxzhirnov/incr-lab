import { Link } from "react-router-dom";
import { EXPERIMENT_SIZE_TOOL_PATH } from "../lib/experimentSizeUrlState";
import { TOOL_PATH } from "../lib/urlState";

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
          <h2>Available tools</h2>
        </div>

        <Link className="tool-card" to={TOOL_PATH}>
          <div className="tool-card__content">
            <span className="eyebrow">Tool</span>
            <h3>Retargeting simulation</h3>
            <p>
              Explore how retargeting can claim more conversions and ROAS than
              it actually creates incrementally.
            </p>
          </div>
          <span className="tool-card__cta">Open tool</span>
        </Link>

        <Link className="tool-card" to={EXPERIMENT_SIZE_TOOL_PATH}>
          <div className="tool-card__content">
            <span className="eyebrow">Tool</span>
            <h3>Experiment size calculator</h3>
            <p>
              Estimate sample size, MDE, duration, and whether your test design
              is realistic before you ship it.
            </p>
          </div>
          <span className="tool-card__cta">Open tool</span>
        </Link>
      </section>
    </main>
  );
}
