// Lenis smooth scrolling (lenis/react) — inertia-eased wheel scroll, the
// same feel as the Framer marketplace "Lenis" component. Mounted per-page
// (landing only) so MapLibre wheel-zoom and app panels stay untouched.
// Skipped entirely for reduced-motion visitors.
import { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";

export function SmoothScroll() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!enabled) return null;
  return <ReactLenis root options={{ lerp: 0.11 }} />;
}
