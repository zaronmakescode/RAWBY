// Per-theme cinematic backdrop. Each accent gets its own looping video
// (drop real footage into /public/bg/<accent>.mp4). Until a file exists the
// video errors and we fall back to the animated gold-aurora layer, so the app
// always has a moving background. A veil + vignette keep glass + text readable.
import { useState } from "react";
import { useTheme } from "../../store/theme";

const SRC: Record<string, string> = {
  amber: "/bg/amber.mp4", // golden black hole in space
  green: "/bg/green.mp4", // nature scene
  azure: "/bg/azure.mp4", // ocean
  rose: "/bg/rose.mp4", // fire / red city
};

export function ThemeBackground() {
  const accent = useTheme((s) => s.accent);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const useVideo = !failed[accent];

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-bg" aria-hidden="true">
      {useVideo ? (
        <video
          key={accent}
          src={SRC[accent]}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setFailed((f) => ({ ...f, [accent]: true }))}
          className="animate-fade-in absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="aurora-layer" />
      )}

      {/* Veil — dims the footage to a rich, moody backdrop. */}
      <div className="absolute inset-0" style={{ background: "rgb(var(--bg) / 0.6)" }} />
      {/* Soft top accent wash + edge vignette. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(75% 45% at 50% -12%, rgb(var(--c-500) / 0.1), transparent 60%), radial-gradient(130% 105% at 50% 36%, transparent 38%, rgb(var(--bg) / 0.9) 100%)",
        }}
      />
    </div>
  );
}
