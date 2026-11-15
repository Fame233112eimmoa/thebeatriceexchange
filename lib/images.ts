import creditsFile from "../data/image-credits.json";

/** Shape written by scripts/fetch-images.ts. */
export type ImageCredit = {
  key: string;
  group: "hero" | "categories" | "products" | "blog" | "about";
  subject: string;
  index: number;
  file: string;
  alt: string;
  query: string;
  source: string;
  sourceId: string;
  sourceUrl: string;
  creator: string;
  creatorUrl: string | null;
  license: string;
  licenseUrl: string;
};

export type SiteImage = { src: string; alt: string };

export const imageCredits = (creditsFile as unknown as { images: ImageCredit[] }).images;

const byKey = new Map(imageCredits.map((image) => [`${image.group}/${image.subject}`, image]));

/** First downloaded photo for e.g. ("categories", "coins"). Undefined until the fetch script has run. */
export function siteImage(group: ImageCredit["group"], subject: string): SiteImage | undefined {
  const image = byKey.get(`${group}/${subject}`);
  return image ? { src: image.file, alt: image.alt } : undefined;
}

/** Downloaded stock photos for a product, in gallery order. */
export function stockProductPhotos(slug: string): SiteImage[] {
  return imageCredits
    .filter((image) => image.group === "products" && image.subject === slug)
    .sort((a, b) => a.index - b.index)
    .map((image) => ({ src: image.file, alt: image.alt }));
}
