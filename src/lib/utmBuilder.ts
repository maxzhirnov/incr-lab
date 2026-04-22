export const UTM_BUILDER_PATH = "/utm-builder";

export type UtmInputs = {
  url: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
};

export const defaultUtmInputs: UtmInputs = {
  url: "https://example.com/landing-page",
  source: "newsletter",
  medium: "email",
  campaign: "spring_launch",
  term: "",
  content: "hero_button",
};

export type UtmValidation = {
  isValid: boolean;
  errors: Partial<Record<keyof UtmInputs, string>>;
  warnings: string[];
};

const slugifyValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "_")
    .replace(/[^a-z0-9._~-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

export const normalizeUtmInput = (key: keyof UtmInputs, value: string) => {
  if (key === "url") {
    return value.trim();
  }

  return slugifyValue(value);
};

const isHttpUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const validateUtmInputs = (inputs: UtmInputs): UtmValidation => {
  const errors: UtmValidation["errors"] = {};
  const warnings: string[] = [];

  if (!inputs.url.trim()) {
    errors.url = "Destination URL is required.";
  } else if (!isHttpUrl(inputs.url.trim())) {
    errors.url = "Use a full URL starting with http:// or https://.";
  }

  (["source", "medium", "campaign"] as const).forEach((key) => {
    if (!inputs[key].trim()) {
      errors[key] = `${key.replace("utm_", "")} is required.`;
    }
  });

  (["source", "medium", "campaign", "term", "content"] as const).forEach(
    (key) => {
      const rawValue = inputs[key];
      const normalizedValue = normalizeUtmInput(key, rawValue);

      if (rawValue && rawValue !== normalizedValue) {
        warnings.push(
          `${key} will work better as "${normalizedValue}" for cleaner reporting.`,
        );
      }
    },
  );

  if (inputs.url.includes("utm_")) {
    warnings.push("Existing UTM parameters will be replaced by this builder.");
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
};

export const buildUtmUrl = (inputs: UtmInputs) => {
  if (!isHttpUrl(inputs.url.trim())) {
    return "";
  }

  const url = new URL(inputs.url.trim());
  const params: Array<[string, string]> = [
    ["utm_source", inputs.source],
    ["utm_medium", inputs.medium],
    ["utm_campaign", inputs.campaign],
    ["utm_term", inputs.term],
    ["utm_content", inputs.content],
  ];

  params.forEach(([key, value]) => {
    const normalizedValue = slugifyValue(value);

    if (normalizedValue) {
      url.searchParams.set(key, normalizedValue);
    } else {
      url.searchParams.delete(key);
    }
  });

  return url.toString();
};

export const buildUtmParameterString = (inputs: UtmInputs) => {
  const params = new URLSearchParams();

  [
    ["utm_source", inputs.source],
    ["utm_medium", inputs.medium],
    ["utm_campaign", inputs.campaign],
    ["utm_term", inputs.term],
    ["utm_content", inputs.content],
  ].forEach(([key, value]) => {
    const normalizedValue = slugifyValue(value);

    if (normalizedValue) {
      params.set(key, normalizedValue);
    }
  });

  return params.toString();
};
