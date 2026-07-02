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

interface SettingsState {
  region: string;
  seasonalPrompts: boolean;
  showCategories: boolean; // the videography box on Home
  holidayMode: boolean; // break the weekly Friday cycle — the clock starts when you start a project
  holidayDays: number; // length of the filming window in holiday mode
  useClaude: boolean; // route Aurora through the owner's Claude subscription (bridge)
  cycleDay: number; // weekday the weekly cycle starts (0 Sun … 6 Sat; default 5 Friday)
  bgVideo: boolean; // real cinematic video background instead of the shader
  bgSpeed: number; // shader motion speed multiplier (0.25–2)
  bgDim: number; // backdrop veil opacity (0.1–0.85) — higher = darker/calmer
  grainAmount: number; // film grain multiplier (0–2); 0 hides it
  reduceMotion: boolean; // damp app animations regardless of OS setting
  showTrips: boolean; // Holiday mode card on Home
  showSteps: boolean; // weekly production stepper on Home
  showRecent: boolean; // recent films + Aurora cards on Home
  setRegion: (r: string) => void;
  setSeasonal: (s: boolean) => void;
  setShowCategories: (s: boolean) => void;
  setHolidayMode: (s: boolean) => void;
  setHolidayDays: (n: number) => void;
  setUseClaude: (s: boolean) => void;
  setCycleDay: (n: number) => void;
  setBgVideo: (s: boolean) => void;
  setBgSpeed: (n: number) => void;
  setBgDim: (n: number) => void;
  setGrainAmount: (n: number) => void;
  setReduceMotion: (s: boolean) => void;
  setShowTrips: (s: boolean) => void;
  setShowSteps: (s: boolean) => void;
  setShowRecent: (s: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      region: "Global",
      seasonalPrompts: true,
      showCategories: true,
      holidayMode: false,
      holidayDays: 7,
      useClaude: false,
      cycleDay: 5,
      bgVideo: false,
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
      setUseClaude: (useClaude) => set({ useClaude }),
      setCycleDay: (cycleDay) => set({ cycleDay: Math.max(0, Math.min(6, Math.round(cycleDay))) }),
      setBgVideo: (bgVideo) => set({ bgVideo }),
      setBgSpeed: (bgSpeed) => set({ bgSpeed: Math.max(0.25, Math.min(2, bgSpeed)) }),
      setBgDim: (bgDim) => set({ bgDim: Math.max(0.1, Math.min(0.85, bgDim)) }),
      setGrainAmount: (grainAmount) => set({ grainAmount: Math.max(0, Math.min(2, grainAmount)) }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setShowTrips: (showTrips) => set({ showTrips }),
      setShowSteps: (showSteps) => set({ showSteps }),
      setShowRecent: (showRecent) => set({ showRecent }),
    }),
    { name: "rawby-settings" }
  )
);
