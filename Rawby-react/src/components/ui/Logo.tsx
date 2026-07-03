// ============================================================
// RAWBY logo — a flat editorial wordmark in the display serif,
// tinted by the accent (--brand-* / cinema tokens). No block,
// no bevel: the type IS the brand.
// ============================================================
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

const WORDMARK: React.CSSProperties = {
  // Deep→mid accent sweep keeps it rich without reading neon.
  background: "linear-gradient(115deg, var(--brand-2) 0%, var(--brand-3) 90%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

export function Logo({ size = "md", className = "" }: { size?: Size; className?: string }) {
  return (
    <span
      className={`h-display inline-flex select-none items-baseline font-black tracking-[0.08em] ${SIZES[size]} ${className}`}
      aria-label="RAWBY"
      style={WORDMARK}
    >
      RAWBY
    </span>
  );
}

/** Compact square mark — flat accent chip with the R, for tight spots. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`h-display flex h-9 w-9 select-none items-center justify-center rounded-lg text-xl font-black ${className}`}
      style={{ background: "rgb(var(--c-500) / 0.14)", color: "rgb(var(--c-500))" }}
      aria-label="RAWBY"
    >
      R
    </span>
  );
}
