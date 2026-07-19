import { levelStyle } from "../../lib/constants";
import { useUiMode } from "../../store/uiMode";

const GRADIENTS: Record<string, string> = {
  "level-sequence": "linear-gradient(135deg,#6FA373,#3D6B41)",
  "level-short": "linear-gradient(135deg,#E8B647,#C97E2C)",
  "level-story": "linear-gradient(135deg,#E85D75,#B12B5C)",
};

export function FilmTag({ level }: { level?: string }) {
  const s = levelStyle(level);
  const isRaw = useUiMode((st) => st.mode) === "raw";
  const onLight = s.gradient === "level-short";
  // RAW mode is monochrome — the coloured tier gradients drop to a neutral chip.
  if (isRaw) {
    return (
      <span className="inline-flex items-center rounded-full border border-hairline bg-chip px-3 py-1 text-xs font-semibold text-text-hi">
        {level ?? "Short Story"} · {s.points} pts
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
      style={{
        backgroundImage: GRADIENTS[s.gradient],
        color: onLight ? "#1A1100" : "#fff",
      }}
    >
      {level ?? "Short Story"} · {s.points} pts
    </span>
  );
}
