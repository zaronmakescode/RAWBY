// Abstract line-art film motifs — decorative, monochrome (currentColor).
// Used for empty states and subtle page decoration. No photos, stays minimal.
import type { SVGProps } from "react";

export type DoodleName = "reel" | "clap" | "strip" | "lens";

const PATHS: Record<DoodleName, JSX.Element> = {
  reel: (
    <>
      <circle cx="60" cy="60" r="46" />
      <circle cx="60" cy="60" r="11" />
      <circle cx="60" cy="29" r="8" />
      <circle cx="60" cy="91" r="8" />
      <circle cx="29" cy="60" r="8" />
      <circle cx="91" cy="60" r="8" />
      <path d="M60 106h34a6 6 0 0 0 6-6" />
    </>
  ),
  clap: (
    <>
      <rect x="24" y="52" width="72" height="44" rx="4" />
      <path d="M24 52v-7l72-9v7" />
      <path d="M38 45l7-8M53 43l7-8M68 41l7-8M83 39l7-8" />
      <path d="M24 68h72" />
    </>
  ),
  strip: (
    <>
      <rect x="32" y="18" width="56" height="84" rx="5" />
      <path d="M32 40h56M32 62h56M32 84h56" />
      {[26, 48, 70, 92].map((y) => (
        <g key={y}>
          <rect x="37" y={y} width="7" height="9" rx="2" />
          <rect x="76" y={y} width="7" height="9" rx="2" />
        </g>
      ))}
    </>
  ),
  lens: (
    <>
      <circle cx="60" cy="60" r="44" />
      <circle cx="60" cy="60" r="30" />
      <path d="M60 30l15 26M90 60l-30 0M75 86l-15-26M45 86l15-26M30 60l30 0M45 34l15 26" />
    </>
  ),
};

export function FilmDoodle({
  name,
  size = 96,
  className = "",
  ...rest
}: { name: DoodleName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
