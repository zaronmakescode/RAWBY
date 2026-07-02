import { Icon } from "./Icon";
import { useTheme, ACCENTS } from "../../store/theme";

/** Compact light/dark toggle for nav bars. */
export function ModeToggle({ className = "" }: { className?: string }) {
  const mode = useTheme((s) => s.mode);
  const toggle = useTheme((s) => s.toggleMode);
  return (
    <button
      onClick={toggle}
      aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-chip text-text-dim transition-colors duration-200 hover:text-text-hi ${className}`}
    >
      <Icon name={mode === "dark" ? "sun" : "moon"} size={18} />
    </button>
  );
}

/** Accent swatch picker — four presets + a pick-anything custom swatch. */
export function AccentPicker() {
  const accent = useTheme((s) => s.accent);
  const setAccent = useTheme((s) => s.setAccent);
  const customColor = useTheme((s) => s.customColor);
  const setCustomColor = useTheme((s) => s.setCustomColor);
  return (
    <div className="flex items-center gap-2">
      {ACCENTS.map((a) => (
        <button
          key={a.id}
          onClick={() => setAccent(a.id)}
          aria-label={`${a.label} accent`}
          aria-pressed={accent === a.id}
          title={a.label}
          className="h-7 w-7 rounded-full transition-transform duration-200 hover:scale-110"
          style={{
            background: a.swatch,
            boxShadow:
              accent === a.id
                ? `0 0 0 2px rgb(var(--bg)), 0 0 0 4px ${a.swatch}`
                : "inset 0 0 0 1px rgba(0,0,0,0.25)",
          }}
        />
      ))}
      {/* Custom — the swatch IS a colour input. Shows the picked colour when
          active, a colour wheel otherwise. */}
      <label
        title="Custom colour"
        className="relative h-7 w-7 cursor-pointer rounded-full transition-transform duration-200 hover:scale-110"
        style={{
          background:
            accent === "custom"
              ? customColor
              : "conic-gradient(#e85d5d, #e8b647, #7ab86a, #4aa8c7, #7b6fd8, #c75da8, #e85d5d)",
          boxShadow:
            accent === "custom"
              ? `0 0 0 2px rgb(var(--bg)), 0 0 0 4px ${customColor}`
              : "inset 0 0 0 1px rgba(0,0,0,0.25)",
        }}
      >
        <input
          type="color"
          value={customColor}
          onChange={(e) => setCustomColor(e.target.value)}
          aria-label="Pick a custom accent colour"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}

/** Full theme block for Settings. */
export function ThemeControls() {
  const mode = useTheme((s) => s.mode);
  const setMode = useTheme((s) => s.setMode);
  const accent = useTheme((s) => s.accent);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-text-hi">Appearance</div>
          <div className="text-xs text-text-dim">Light or dark surface.</div>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-hairline bg-field p-1 text-xs font-semibold">
          {(["dark", "light"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 capitalize transition-colors ${
                mode === m ? "bg-cinema-500 text-[#1A1100]" : "text-text-dim hover:text-text-hi"
              }`}
            >
              <Icon name={m === "dark" ? "moon" : "sun"} size={14} />
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-text-hi">Accent</div>
          <div className="text-xs text-text-dim">
            {accent === "custom"
              ? "Custom — the whole app repaints from your colour."
              : "Recolours the UI + logo, or pick any colour with the wheel."}
          </div>
        </div>
        <AccentPicker />
      </div>
    </div>
  );
}
