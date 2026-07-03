// ============================================================
// RAWBY — user prompt settings (Zustand, persisted). Region +
// seasonal toggle feed /api/generate-prompts for local/seasonal results.
// ============================================================
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Suggestions for the region picker — it's a free-text input, so any
// country works even if it's not listed here.
export const COUNTRIES = [
  "Global",
  "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Bulgaria",
  "Canada", "Chile", "China", "Colombia", "Croatia", "Czechia", "Denmark",
  "Egypt", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
  "Iceland", "India", "Indonesia", "Ireland", "Israel", "Italy", "Japan",
  "Kenya", "Latvia", "Lithuania", "Malaysia", "Mexico", "Morocco",
  "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru",
  "Philippines", "Poland", "Portugal", "Romania", "Saudi Arabia", "Serbia",
  "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain",
  "Sweden", "Switzerland", "Thailand", "Turkey", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Vietnam",
] as const;

/** Aurora's brain: free Groq, the owner's Claude bridge, or your own key. */
export type AiProvider = "groq" | "bridge" | "apikey";
/** Backdrop: animated shader scene, real footage, or a flat single colour. */
export type BgMode = "shader" | "video" | "solid";

interface SettingsState {
  region: string;
  seasonalPrompts: boolean;
  showCategories: boolean; // the videography web on Home
  holidayMode: boolean; // break the weekly cycle — the clock starts when you start a project
  holidayDays: number; // length of the filming window in holiday mode
  aiProvider: AiProvider;
  anthropicKey: string; // user's own Anthropic API key (stored locally, sent per request)
  cycleDay: number; // weekday the weekly cycle starts (0 Sun … 6 Sat; default 5 Friday)
  bgMode: BgMode;
  bgSpeed: number; // shader motion speed multiplier (0.25–2)
  bgDim: number; // backdrop veil opacity (0.1–0.85) — higher = darker/calmer
  grainAmount: number; // film grain multiplier (0–2); 0 hides it
  reduceMotion: boolean; // damp app animations regardless of OS setting
  showTrips: boolean; // Holiday mode card on Home
  showSteps: boolean; // weekly production stepper on Home
  showRecent: boolean; // recent films card on Home
  setRegion: (r: string) => void;
  setSeasonal: (s: boolean) => void;
  setShowCategories: (s: boolean) => void;
  setHolidayMode: (s: boolean) => void;
  setHolidayDays: (n: number) => void;
  setAiProvider: (p: AiProvider) => void;
  setAnthropicKey: (k: string) => void;
  setCycleDay: (n: number) => void;
  setBgMode: (m: BgMode) => void;
  setBgSpeed: (n: number) => void;
  setBgDim: (n: number) => void;
  setGrainAmount: (n: number) => void;
  setReduceMotion: (s: boolean) => void;
  setShowTrips: (s: boolean) => void;
  setShowSteps: (s: boolean) => void;
  setShowRecent: (s: boolean) => void;
}

/** What a chat/prompt request should send for the current provider choice. */
export function aiRequestFields(aiProvider: AiProvider, anthropicKey: string): {
  provider: "groq" | "claude";
  apiKey?: string;
} {
  if (aiProvider === "apikey" && anthropicKey.trim()) {
    return { provider: "claude", apiKey: anthropicKey.trim() };
  }
  if (aiProvider === "bridge") return { provider: "claude" };
  return { provider: "groq" };
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      region: "Global",
      seasonalPrompts: true,
      showCategories: true,
      holidayMode: false,
      holidayDays: 7,
      aiProvider: "groq",
      anthropicKey: "",
      cycleDay: 5,
      bgMode: "shader",
      bgSpeed: 1,
      bgDim: 0.44,
      grainAmount: 1,
      reduceMotion: false,
      showTrips: true,
      showSteps: true,
      showRecent: true,
      setRegion: (region) => set({ region }),
      setSeasonal: (seasonalPrompts) => set({ seasonalPrompts }),
      setShowCategories: (showCategories) => set({ showCategories }),
      setHolidayMode: (holidayMode) => set({ holidayMode }),
      setHolidayDays: (holidayDays) => set({ holidayDays: Math.max(1, Math.min(60, holidayDays)) }),
      setAiProvider: (aiProvider) => set({ aiProvider }),
      setAnthropicKey: (anthropicKey) => set({ anthropicKey }),
      setCycleDay: (cycleDay) => set({ cycleDay: Math.max(0, Math.min(6, Math.round(cycleDay))) }),
      setBgMode: (bgMode) => set({ bgMode }),
      setBgSpeed: (bgSpeed) => set({ bgSpeed: Math.max(0.25, Math.min(2, bgSpeed)) }),
      setBgDim: (bgDim) => set({ bgDim: Math.max(0.1, Math.min(0.85, bgDim)) }),
      setGrainAmount: (grainAmount) => set({ grainAmount: Math.max(0, Math.min(2, grainAmount)) }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setShowTrips: (showTrips) => set({ showTrips }),
      setShowSteps: (showSteps) => set({ showSteps }),
      setShowRecent: (showRecent) => set({ showRecent }),
    }),
    {
      name: "rawby-settings",
      // Old persisted shapes carry over: bgVideo:true → video mode,
      // useClaude:true → bridge provider.
      migrate: (persisted: unknown) => {
        const p = (persisted ?? {}) as Record<string, unknown>;
        if (p.bgMode == null && p.bgVideo === true) p.bgMode = "video";
        if (p.aiProvider == null && p.useClaude === true) p.aiProvider = "bridge";
        return p as never;
      },
      version: 1,
    }
  )
);
