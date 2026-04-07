export type CurrencyCode = "USD" | "EUR" | "GBP" | "RUB";

export const currencyOptions: CurrencyCode[] = ["USD", "EUR", "GBP", "RUB"];

const currencyLocales: Record<CurrencyCode, string> = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  RUB: "ru-RU",
};

export type Formatters = {
  count: (value: number) => string;
  percent: (value: number, maximumFractionDigits?: number) => string;
  currency: (value: number, maximumFractionDigits?: number) => string;
  currencyUnit: () => string;
  roas: (value: number) => string;
  roasExplanation: (value: number) => string;
  multiple: (value: number) => string;
};

export const createFormatters = (currencyCode: CurrencyCode): Formatters => {
  const locale = currencyLocales[currencyCode];

  const countFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  });

  const roasFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  });

  return {
    count: (value) => countFormatter.format(value),
    percent: (value, maximumFractionDigits = 0) =>
      new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits,
      }).format(value),
    currency: (value, maximumFractionDigits = 0) =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits,
      }).format(value),
    currencyUnit: () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(1),
    roas: (value) => `${roasFormatter.format(value)}x`,
    roasExplanation: (value) =>
      `${new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(value)} revenue per ${new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(1)} spent`,
    multiple: (value) =>
      Number.isFinite(value) ? `${roasFormatter.format(value)}x` : "No lift",
  };
};
