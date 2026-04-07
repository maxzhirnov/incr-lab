type MetadataConfig = {
  title: string;
  description: string;
  url: string;
};

const setMeta = (
  selector: string,
  attribute: "content" | "href",
  value: string,
) => {
  const element = document.head.querySelector(selector);

  if (element) {
    element.setAttribute(attribute, value);
  }
};

export const applyMetadata = ({ title, description, url }: MetadataConfig) => {
  document.title = title;

  setMeta('meta[name="description"]', "content", description);
  setMeta('meta[property="og:title"]', "content", title);
  setMeta('meta[property="og:description"]', "content", description);
  setMeta('meta[property="og:url"]', "content", url);
  setMeta('meta[name="twitter:title"]', "content", title);
  setMeta('meta[name="twitter:description"]', "content", description);
  setMeta('link[rel="canonical"]', "href", url);
};
