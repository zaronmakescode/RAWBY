// ============================================================
// RAWBY — interface mode store (Zustand, persisted). Drives the
// data-ui attribute on <html>: "studio" is the full app, "raw" is
// the stripped-back, low-tool variant. Toggled from the logo.
// ============================================================
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UiMode = "studio" | "raw";

export function applyUiMode(mode: UiMode) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-ui", mode);
}

interface UiModeState {
  mode: UiMode;
  hasSeenRawHint: boolean;
  toggleMode: () => UiMode;
  markRawHintSeen: () => void;
}

export const useUiMode = create<UiModeState>()(
  persist(
    (set, get) => ({
      mode: "studio",
      hasSeenRawHint: false,
      toggleMode: () => {
        const mode = get().mode === "studio" ? "raw" : "studio";
        applyUiMode(mode);
        set({ mode });
        return mode;
      },
      markRawHintSeen: () => set({ hasSeenRawHint: true }),
    }),
    {
      name: "rawby-ui-mode",
      onRehydrateStorage: () => (state) => {
        if (state) applyUiMode(state.mode);
      },
    }
  )
);
