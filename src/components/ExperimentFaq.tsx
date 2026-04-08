import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    question: "What is MDE?",
    answer:
      "It is the smallest improvement your test is built to detect. Smaller MDE means more sensitivity, but much larger sample sizes. Larger MDE makes tests faster, but you may miss smaller wins.",
  },
  {
    question: "Why does sample size grow so fast?",
    answer:
      "Small changes are hard to separate from normal variation. Once you ask the test to detect a tiny lift reliably, data requirements rise sharply, which is why many tests become slow or unrealistic.",
  },
  {
    question: "How should I choose MDE?",
    answer:
      "Start with business relevance, not math. Ask what is the smallest lift that would actually change a decision. As a rule of thumb, 5-10% is ambitious, 10-20% is practical in many cases, and 20%+ is easier to test but often less realistic.",
  },
  {
    question: "How many groups should I test?",
    answer:
      "Every extra group splits traffic and pushes sample needs higher. Two or three groups are usually practical. Four or more groups become slower and more expensive, especially with a small MDE.",
  },
  {
    question: "What is statistical significance?",
    answer:
      "It is the confidence threshold for calling a result real rather than noise. 95% is the standard default in many cases. Higher significance gives you stricter evidence, but it also requires more data.",
  },
  {
    question: "What is statistical power?",
    answer:
      "Power is the chance of detecting the effect if it truly exists. 80% is a common default. Higher power reduces the risk of missing a real lift, but it increases sample size.",
  },
];

export function ExperimentFaq() {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    setOpenIndexes((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  };

  return (
    <section className="panel experiment-faq-panel">
      <div className="panel__header panel__header--stacked">
        <div>
          <span className="eyebrow">Quick FAQ</span>
          <h3>How to think about experiment size</h3>
          <p>The definitions matter less than the tradeoffs they create.</p>
        </div>
      </div>

      <div className="faq-list">
        {faqItems.map((item, index) => {
          const isOpen = openIndexes.includes(index);

          return (
            <article
              key={item.question}
              className={`faq-item${isOpen ? " faq-item--open" : ""}`}
            >
              <button
                aria-expanded={isOpen}
                className="faq-item__trigger"
                onClick={() => toggleItem(index)}
                type="button"
              >
                <span className="faq-item__question">{item.question}</span>
                <span className="faq-item__icon-wrap" aria-hidden="true">
                  <span className="faq-item__icon">
                    <span className="faq-item__icon-line faq-item__icon-line--horizontal" />
                    <span className="faq-item__icon-line faq-item__icon-line--vertical" />
                  </span>
                </span>
              </button>
              <div
                className={`faq-item__content${isOpen ? " faq-item__content--open" : ""}`}
                aria-hidden={!isOpen}
              >
                <div className="faq-item__content-inner">
                  <div className="faq-item__answer">
                  <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
