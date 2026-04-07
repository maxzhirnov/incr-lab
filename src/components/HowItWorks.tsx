export function HowItWorks() {
  return (
    <section className="panel how-it-works">
      <div className="panel__header panel__header--stacked">
        <div>
          <span className="eyebrow">How this works</span>
          <h3>A simple deterministic model</h3>
        </div>
      </div>

      <div className="how-it-works__grid">
        <article>
          <h4>Some users convert anyway</h4>
          <p>
            These people were already on track to buy. If they happen to see a
            retargeting ad, channel reporting may still count them.
          </p>
        </article>
        <article>
          <h4>Some users are persuadable</h4>
          <p>
            Retargeting can create real lift only in this segment, and only
            among the users actually reached by ads.
          </p>
        </article>
        <article>
          <h4>Attribution is not incrementality</h4>
          <p>
            Attributed conversions include exposed users who would convert
            anyway. Incremental conversions include only the conversions created
            by ad exposure.
          </p>
        </article>
      </div>
    </section>
  );
}
