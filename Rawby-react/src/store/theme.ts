// ============================================================
// RAWBY — theme store (Zustand, persisted). Drives the
// data-theme (light/dark) + data-accent attributes on <html>,
// which the CSS variables key off. Also supports a fully custom
// accent: pick any colour and the whole palette (c-300..700,
// brand gradient, ink, glow) is generated and applied inline.
// ============================================================
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Mode = "dark" | "light";
export type PresetAccent = "amber" | "green" | "azure" | "rose";
export type Accent = PresetAccent | "custom";

export const ACCENTS: { id: PresetAccent; label: string; swatch: string }[] = [
  { id: "amber", label: "Cinema", swatch: "#E8B647" },
  { id: "green", label: "Pine", swatch: "#5A8A5E" },
  { id: "azure", label: "Azure", swatch: "#3B82F6" },
  { id: "rose", label: "Ember", swatch: "#E85D75" },
];

// ─── Colour math ─────────────────────────────────────────────
function hexToHsl(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb: [number, number, number];
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return [
    Math.round((rgb[0] + m) * 255),
    Math.round((rgb[1] + m) * 255),
    Math.round((rgb[2] + m) * 255),
  ];
}

const triplet = (h: number, s: number, l: number) => hslToRgb(h, s, l).join(" ");
const hexOf = (h: number, s: number, l: number) => {
  const [r, g, b] = hslToRgb(h, s, l);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

/** Full theme palette generated from a single picked colour. */
export function paletteFromHex(hex: string) {
  const [h, sRaw, lRaw] = hexToHsl(hex);
  // Nudge toward the app's pastel range so custom colours behave like presets.
  const s = Math.max(0.18, Math.min(0.72, sRaw));
  const l = Math.max(0.42, Math.min(0.72, lRaw));
  return {
    c300: triplet(h, s * 0.92, Math.min(0.88, l + 0.16)),
    c400: triplet(h, s * 0.97, Math.min(0.8, l + 0.08)),
    c500: triplet(h, s, l),
    c600: triplet(h, s, Math.max(0.24, l - 0.12)),
    c700: triplet(h, s * 0.94, Math.max(0.16, l - 0.24)),
    brand1: hexOf(h, s * 0.85, Math.min(0.87, l + 0.17)),
    brand2: hexOf(h, s, l),
    brand3: hexOf(h, s * 0.94, Math.max(0.2, l - 0.22)),
    ink: hexOf(h, Math.min(0.75, s * 0.9), 0.1),
    glow: triplet(h, s, l),
  };
}

/** Which preset a custom colour is closest to (used to pick a bg video). */
export function nearestPresetAccent(hex: string): PresetAccent {
  const [h, s] = hexToHsl(hex);
  if (s < 0.12) return "amber"; // near-grey → neutral gold
  const hues: { id: PresetAccent; hue: number }[] = [
    { id: "rose", hue: 12 },
    { id: "amber", hue: 43 },
    { id: "green", hue: 120 },
    { id: "azure", hue: 218 },
  ];
  let best: PresetAccent = "amber";
  let bestD = 999;
  for (const { id, hue } of hues) {
    const d = Math.min(Math.abs(h - hue), 360 - Math.abs(h - hue));
    if (d < bestD) {
      bestD = d;
      best = id;
    }
  }
  return best;
}

const CUSTOM_VARS = [
  "--c-300", "--c-400", "--c-500", "--c-600", "--c-700",
  "--brand-1", "--brand-2", "--brand-3", "--brand-ink", "--glow",
];

function applyCustomVars(hex: string) {
  const p = paletteFromHex(hex);
  const st = document.documentElement.style;
  st.setProperty("--c-300", p.c300);
  st.setProperty("--c-400", p.c400);
  st.setProperty("--c-500", p.c500);
  st.setProperty("--c-600", p.c600);
  st.setProperty("--c-700", p.c700);
  st.setProperty("--brand-1", p.brand1);
  st.setProperty("--brand-2", p.brand2);
  st.setProperty("--brand-3", p.brand3);
  st.setProperty("--brand-ink", p.ink);
  st.setProperty("--glow", p.glow);
}

function clearCustomVars() {
  const st = document.documentElement.style;
  for (const v of CUSTOM_VARS) st.removeProperty(v);
}

interface ThemeState {
  mode: Mode;
  accent: Accent;
  customColor: string; // hex, drives the palette when accent === "custom"
  setMode: (m: Mode) => void;
  toggleMode: () => void;
  setAccent: (a: PresetAccent) => void;
  setCustomColor: (hex: string) => void;
}

export function applyTheme(mode: Mode, accent: Accent, customColor?: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", mode);
  root.setAttribute("data-accent", accent);
  if (accent === "custom" && customColor) applyCustomVars(customColor);
  else clearCustomVars();
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "dark",
      accent: "amber",
      customColor: "#8b7bd8",
      setMode: (mode) => {
        applyTheme(mode, get().accent, get().customColor);
        set({ mode });
      },
      toggleMode: () => {
        const mode = get().mode === "dark" ? "light" : "dark";
        applyTheme(mode, get().accent, get().customColor);
        set({ mode });
      },
      setAccent: (accent) => {
        applyTheme(get().mode, accent);
        set({ accent });
      },
      setCustomColor: (customColor) => {
        applyTheme(get().mode, "custom", customColor);
        set({ accent: "custom", customColor });
      },
    }),
    {
      name: "rawby-theme",
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.mode, state.accent, state.customColor);
      },
    }
  )
);
