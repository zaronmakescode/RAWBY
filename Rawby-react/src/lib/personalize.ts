import type { GearItem, ProjectHistoryItem, Trip, UserProfile } from "../types";

export function gearLabels(gear: GearItem[] = []): string[] {
  return gear.map((g) => [g.brand, g.type].filter(Boolean).join(" ")).filter(Boolean);
}

/** Short one-line summaries of recent films — for Aurora context + anti-repeat. */
export function filmSummaries(history: ProjectHistoryItem[] = [], limit = 6): string[] {
  return history
    .slice(-limit)
    .reverse()
    .map((h) => {
      const bits = [h.title, h.level];
      if (h.categories?.length) bits.push(h.categories.join("/"));
      if (typeof h.likes === "number") bits.push(`${h.likes} likes`);
      return bits.filter(Boolean).join(" · ");
    });
}

/** Upcoming planned trips as short lines for Aurora context. */
export function tripSummaries(trips: Trip[] = []): string[] {
  return trips
    .filter((t) => t.status !== "done")
    .map((t) => `${t.title} · ${t.startDate} · ${t.days}d${t.promptText ? " (prompt ready)" : ""}`);
}

/** Build a personalization string the server folds into the prompt seed. */
export function personalizationText(
  profile?: UserProfile,
  gear: GearItem[] = [],
  history: ProjectHistoryItem[] = [],
  facts: string[] = []
): string {
  const parts: string[] = [];
  if (profile?.location) parts.push(`Filmmaker is based in / shoots around: ${profile.location}.`);
  if (profile?.style) parts.push(`Preferred style / vibe: ${profile.style}.`);
  if (profile?.experience) parts.push(`Experience level: ${profile.experience}.`);
  if (profile?.focus) parts.push(`What they want from filmmaking: ${profile.focus}.`);
  const gl = gearLabels(gear);
  if (gl.length) {
    parts.push(`They own this gear: ${gl.join(", ")}. Favour ideas achievable with this kit.`);
  }
  const films = filmSummaries(history, 6);
  if (films.length) {
    parts.push(`Recent films (avoid repeating these): ${films.join("; ")}.`);
  }
  if (facts.length) parts.push(`Aurora remembers: ${facts.join("; ")}.`);
  return parts.join(" ");
}
