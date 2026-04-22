import { Link } from "react-router-dom";
import { useEffect } from "react";
import { applyMetadata } from "../lib/metadata";
import {
  READINESS_FRAMEWORK_PATH,
  READINESS_SCORE_PATH,
  frameworkDimensions,
} from "../lib/readinessScore";

const principles = [
  {
    title: "Readiness is an operating constraint, not a statistical score",
    body: "Most incrementality readouts fail because teams disagree on data, control groups, decision rules, or ownership before the model is ever the hard part.",
  },
  {
    title: "The weakest dimension should drive the roadmap",
    body: "A high average score can hide the one condition that will invalidate trust. The framework therefore elevates the primary blocker.",
  },
  {
    title: "The recommended test design should fit the organization",
    body: "A geo test, platform holdout, or foundation audit can all be correct depending on signal volume, spend concentration, and decision discipline.",
  },
];

export function ReadinessFrameworkPage() {
  useEffect(() => {
    applyMetadata({
      title: "Incrementality Readiness Framework — Incrementality Lab",
      description:
        "A practical framework for diagnosing whether a marketing team is ready to use incrementality testing for budget decisions.",
      url: `https://lab.mzhirnov.com${READINESS_FRAMEWORK_PATH}`,
      image: "https://lab.mzhirnov.com/og/incrementality-readiness.png",
    });
  }, []);

  return (
    <main className="framework-shell">
      <section className="framework-hero">
        <span className="eyebrow">Incrementality Readiness Framework</span>
        <h1>Readiness comes before incrementality testing</h1>
        <p>
          A practical framework for diagnosing whether a marketing team can make
          causal budget decisions without turning the readout into a debate
          about data quality, incentives, or attribution politics.
        </p>
        <Link className="tool-card__cta framework-hero__cta" to={READINESS_SCORE_PATH}>
          Run diagnostic
        </Link>
      </section>

      <section className="panel framework-panel">
        <div className="panel__header panel__header--stacked">
          <div>
            <span className="eyebrow">Core idea</span>
            <h2>Incrementality is an organizational capability</h2>
            <p>
              A test can be statistically valid and still useless if the
              organization cannot agree on the outcome, the control group, or
              the action that follows. Readiness measures whether the operating
              system around the test can support a trusted decision.
            </p>
          </div>
        </div>
        <div className="framework-principles">
          {principles.map((principle) => (
            <article key={principle.title}>
              <strong>{principle.title}</strong>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel framework-panel">
        <div className="panel__header panel__header--stacked">
          <div>
            <span className="eyebrow">Five dimensions</span>
            <h2>The readiness model</h2>
            <p>
              The score combines five dimensions. The lowest dimension becomes
              the primary blocker because trust usually breaks at the weakest
              operating point.
            </p>
          </div>
        </div>
        <div className="framework-dimensions">
          {frameworkDimensions.map((dimension, index) => (
            <article key={dimension.key}>
              <span>{index + 1}</span>
              <div>
                <strong>{dimension.title}</strong>
                <p>{dimension.principle}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel framework-panel">
        <div className="panel__header panel__header--stacked">
          <div>
            <span className="eyebrow">How to use it</span>
            <h2>From score to action</h2>
          </div>
        </div>
        <div className="framework-steps">
          <article>
            <strong>1. Diagnose the current operating state</strong>
            <p>Answer concrete questions about data, test design, decision rules, signal, and alignment.</p>
          </article>
          <article>
            <strong>2. Identify the primary blocker</strong>
            <p>Do not start with the fanciest test. Start with the constraint most likely to invalidate trust.</p>
          </article>
          <article>
            <strong>3. Pick the smallest credible design</strong>
            <p>Use the recommended path to choose between a foundation audit, platform holdout, single-channel holdout, or geo test.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
