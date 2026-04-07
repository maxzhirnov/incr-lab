import type { SimulationInputs } from "./simulation";

type BenchmarkRange = {
  min: number;
  max: number;
  typicalLabel: string;
};

export const benchmarkRanges: Partial<
  Record<keyof SimulationInputs, BenchmarkRange>
> = {
  pctConvertAnyway: {
    min: 0.05,
    max: 0.2,
    typicalLabel: "Typical: 5-20%",
  },
  pctPersuadable: {
    min: 0.1,
    max: 0.4,
    typicalLabel: "Typical: 10-40%",
  },
  retargetingReach: {
    min: 0.4,
    max: 0.9,
    typicalLabel: "Typical: 40-90%",
  },
  persuadableConversionLift: {
    min: 0.1,
    max: 0.3,
    typicalLabel: "Typical: 10-30%",
  },
};

export const isWithinRange = (value: number, min: number, max: number) =>
  value >= min && value <= max;

export const getBenchmarkStatus = (
  value: number,
  min: number,
  max: number,
): "below" | "above" | null => {
  if (value < min) {
    return "below";
  }

  if (value > max) {
    return "above";
  }

  return null;
};
