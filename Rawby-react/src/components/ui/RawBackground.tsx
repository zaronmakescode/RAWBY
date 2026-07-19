// RAW-mode backdrop — pure black / pure white with a field of slow, monochrome
// wave lines. No accent, no shader, no video: the quiet room RAW mode lives in.
// Colour comes from --text-hi at a low opacity, so it flips with the theme.
import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";

const VW = 1600;
const VH = 1000;
const STEP = 24; // sample spacing along each wave
const ROWS = 20; // number of wave lines
const GAP = VH / (ROWS - 1);

/** One horizontal wave as a smooth polyline path string. */
function wavePath(baseY: number, amp: number, wavelength: number, phase: number): string {
  let d = "";
  for (let x = -80; x <= VW + 80; x += STEP) {
    const y = baseY + amp * Math.sin((x / wavelength) * Math.PI * 2 + phase);
    d += `${x === -80 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)} `;
  }
  return d.trim();
}

export function RawBackground() {
  const reduce = useReducedMotion();
  const rows = useMemo(
    () =>
      Array.from({ length: ROWS }, (_, i) => {
        // Vary each line a little so the field reads organic, not printed.
        const amp = 10 + ((i * 7) % 13);
        const wavelength = 420 + ((i * 53) % 220);
        const phase = (i * 1.3) % (Math.PI * 2);
        return { d: wavePath(i * GAP, amp, wavelength, phase), opacity: 0.5 + (i % 3) * 0.18 };
      }),
    []
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "rgb(var(--bg))" }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g
          className={reduce ? "" : "animate-raw-waves"}
          stroke="rgb(var(--text-hi))"
          strokeWidth="1"
        >
          {rows.map((r, i) => (
            <path key={i} d={r.d} strokeOpacity={0.05 * r.opacity} />
          ))}
        </g>
      </svg>
      {/* Soft vignette so the waves fade to a calm centre. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 40%, rgb(var(--bg) / 0.9) 100%)",
        }}
      />
    </div>
  );
}
