// True when the OS requests reduced motion. The 3D scene still renders
// (a static frame is not "motion"), but all useFrame animation, cycling,
// and parallax are skipped so we honour the preference.
export const REDUCED =
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
