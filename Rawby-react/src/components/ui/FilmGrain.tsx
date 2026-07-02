// Faint animated film-grain overlay. Pointer-events off, above content.
// Base opacity follows --grain-opacity (lighter in light theme), scaled by
// the user's grain setting (0 hides it entirely).
import { useSettings } from "../../store/settings";

export function FilmGrain({ opacity }: { opacity?: number }) {
  const grainAmount = useSettings((s) => s.grainAmount);
  if (opacity == null && grainAmount <= 0) return null;
  return (
    <div
      aria-hidden="true"
      className="film-grain pointer-events-none fixed inset-0 z-grain animate-grain mix-blend-overlay"
      style={{ opacity: opacity ?? `calc(var(--grain-opacity) * ${grainAmount})` }}
    />
  );
}
