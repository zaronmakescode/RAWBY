// ============================================================
// RAWBY — domain constants (scoring, weekly cycle, level styling)
// ============================================================

export const LEVELS = [
  { name: "Sequence", points: 10, gradient: "level-sequence", glow: "#5A8A5E" },
  { name: "Short Story", points: 30, gradient: "level-short", glow: "#E8B647" },
  { name: "Story + Character", points: 50, gradient: "level-story", glow: "#E85D75" },
  { name: "Big Project", points: 150, gradient: "level-story", glow: "#B12B5C" },
] as const;

export function levelStyle(level?: string) {
  return LEVELS.find((l) => l.name === level) ?? LEVELS[1];
}

// How much each like is worth, scaled by level. Score = base + likes·weight·lateMult.
export const LEVEL_WEIGHT: Record<string, number> = {
  Sequence: 0.5,
  "Short Story": 1,
  "Story + Character": 2,
  "Big Project": 5,
};

export function likesBonus(level: string, likes: number, lateMult: number): number {
  return Math.round(likes * (LEVEL_WEIGHT[level] ?? 1) * lateMult);
}

export const GEAR_CATEGORIES = ["Filming", "Editing", "Digital"] as const;

// The "videography box" — four corners + an emotional heart in the middle.
// A film can belong to more than one (overlap is expected).
export const VIDEO_CATEGORIES = [
  {
    id: "educational",
    label: "Educational",
    blurb: "Life lessons, how-tos, teaching",
    icon: "bulb",
    color: "#3B82F6",
    corner: "tl",
  },
  {
    id: "outdoors",
    label: "Outdoors",
    blurb: "Travel, drone, nature, adventure",
    icon: "sun",
    color: "#5A8A5E",
    corner: "tr",
  },
  {
    id: "commercial",
    label: "Commercial",
    blurb: "Unboxings, ads, show-arounds",
    icon: "tag",
    color: "#E8B647",
    corner: "bl",
  },
  {
    id: "mylife",
    label: "My Life",
    blurb: "BTS, a day in the life, your craft",
    icon: "user",
    color: "#A78BFA",
    corner: "br",
  },
  {
    id: "emotions",
    label: "Emotions",
    blurb: "Stories that say who you are",
    icon: "heart",
    color: "#E85D75",
    corner: "center",
  },
] as const;

export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];

// Late penalty multipliers (days past deadline).
export const LATE_MULTIPLIERS = [
  { day: "On time", mult: 1.0 },
  { day: "Day 1", mult: 0.9 },
  { day: "Day 2", mult: 0.75 },
  { day: "Day 3+", mult: 0.5 },
] as const;

// Weekly production cycle. `day` labels describe the default Friday start;
// use cycleDayLabel()/isCyclePhaseToday() when the user moved their cycle day.
export const WEEKLY_CYCLE = [
  { day: "Friday", phase: "Song + Prompt", desc: "Song selection + prompt locked" },
  { day: "Sat–Sun", phase: "Filming", desc: "Shoot your footage" },
  { day: "Mon–Tue", phase: "Rough Edit", desc: "Assemble the cut" },
  { day: "Tue–Wed", phase: "VFX + Text", desc: "Effects + overlays" },
  { day: "Tue–Wed", phase: "SFX + Sound", desc: "Sound design" },
  { day: "Wed–Thu", phase: "Colour Grade", desc: "Grade the look" },
  { day: "Friday", phase: "Polish + Publish", desc: "Finish + release" },
] as const;

// Day-offsets of each cycle phase from the cycle-start day (index-aligned
// with WEEKLY_CYCLE; the last phase lands back on the start day, a week on).
const CYCLE_OFFSETS: number[][] = [[0], [1, 2], [3, 4], [4, 5], [4, 5], [5, 6], [0]];

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Label for a cycle phase given the user's cycle-start weekday (0–6). */
export function cycleDayLabel(phaseIdx: number, cycleDay: number): string {
  const offs = CYCLE_OFFSETS[phaseIdx] ?? [0];
  const names = offs.map((o) => DAY_SHORT[(cycleDay + o) % 7]);
  const uniq = [...new Set(names)];
  return uniq.length === 1 ? DAY_NAMES[(cycleDay + offs[0]) % 7] : uniq.join("–");
}

/** Is today one of this phase's days, for the given cycle-start weekday? */
export function isCyclePhaseToday(phaseIdx: number, cycleDay: number, now = new Date()): boolean {
  const rel = (now.getDay() - cycleDay + 7) % 7;
  return (CYCLE_OFFSETS[phaseIdx] ?? []).includes(rel);
}

/** Days until the next cycle start (1–7; a full 7 on the cycle day itself). */
export function daysUntilCycleEnd(cycleDay: number, now = new Date()): number {
  return ((cycleDay - now.getDay() + 7) % 7) || 7;
}
