import type { GearItem, UserProfile } from "../types";

export function gearLabels(gear: GearItem[] = []): string[] {
  return gear.map((g) => [g.brand, g.type].filter(Boolean).join(" ")).filter(Boolean);
}

/** Build a personalization string the server folds into the prompt seed. */
export function personalizationText(profile?: UserProfile, gear: GearItem[] = []): string {
  const parts: string[] = [];
  if (profile?.location) parts.push(`Filmmaker is based in / shoots around: ${profile.location}.`);
  if (profile?.style) parts.push(`Preferred style / vibe: ${profile.style}.`);
  if (profile?.experience) parts.push(`Experience level: ${profile.experience}.`);
  if (profile?.focus) parts.push(`What they want from filmmaking: ${profile.focus}.`);
  const gl = gearLabels(gear);
  if (gl.length) {
    parts.push(`They own this gear: ${gl.join(", ")}. Favour ideas achievable with this kit.`);
  }
  return parts.join(" ");
}
