// In demand frameloop (reduced-motion), the Canvas paints once on mount —
// before the lazy/Suspense scene is ready — and then never again. Mounting
// this inside <Suspense> (so it appears only after the scene resolves) and
// nudging invalidate() a few times guarantees the static frame gets drawn.
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

export function PaintOnce() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
    const timers = [60, 200, 500, 1000].map((ms) => setTimeout(invalidate, ms));
    return () => timers.forEach(clearTimeout);
  }, [invalidate]);
  return null;
}
