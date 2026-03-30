import type { EventHomepageBlock } from "@/features/events/types";

export type ParsedEventMetadata = {
  homepage_featured: boolean;
  homepage: EventHomepageBlock;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) {
    return null;
  }
  return v as Record<string, unknown>;
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim().length > 0 ? v : undefined;
}

function asStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  return out.length > 0 ? out : undefined;
}

export function parseEventMetadata(metadata: unknown): ParsedEventMetadata {
  const root = asRecord(metadata) ?? {};
  const hp = asRecord(root.homepage) ?? {};

  const homepage: EventHomepageBlock = {
    featured: hp.featured === true,
    heroTitle: asString(hp.heroTitle),
    heroSubtitle: asString(hp.heroSubtitle),
    heroImage: asString(hp.heroImage),
    dateLine: asString(hp.dateLine),
    locationLine: asString(hp.locationLine),
    storyTitle: asString(hp.storyTitle),
    storyLead: asString(hp.storyLead),
    storyBody: asString(hp.storyBody),
    storyBullets: asStringArray(hp.storyBullets),
    storyImage: asString(hp.storyImage),
    artistImages: asStringArray(hp.artistImages)
  };

  const homepage_featured = root.homepage_featured === true || homepage.featured === true;

  return { homepage_featured, homepage };
}
