import { useState } from "react";

type InfoHintProps = {
  text: string;
};

export function InfoHint({ text }: InfoHintProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const isOpen = isHovered || isPinned;

  return (
    <span
      className="info-hint"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        aria-expanded={isOpen}
        aria-label="Show more context"
        className={`info-hint__button${isOpen ? " info-hint__button--open" : ""}`}
        onBlur={() => setIsPinned(false)}
        onClick={() => setIsPinned((current) => !current)}
        type="button"
      >
        i
      </button>
      <span className={`info-hint__popover${isOpen ? " info-hint__popover--open" : ""}`}>
        {text}
      </span>
    </span>
  );
}
