// Difference-blend cursor dot — web translation of the Framer marketplace
// "Magic Blend Cursor" interaction. A spring-lagged dot rides the pointer
// and swells over interactive elements; mix-blend-difference keeps it
// visible on any background. Pointer-fine devices only, honors
// prefers-reduced-motion, and never blocks hits (pointer-events: none).
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function BlendCursor() {
  const [active, setActive] = useState(false);
  const [hoveringLink, setHoveringLink] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 400, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 400, damping: 40, mass: 0.5 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setActive(true);

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target;
      setHoveringLink(
        t instanceof Element &&
          !!t.closest("a, button, [role='button'], input, textarea, select")
      );
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  if (!active) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full bg-white mix-blend-difference"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{
        width: hoveringLink ? 44 : 12,
        height: hoveringLink ? 44 : 12,
        opacity: hoveringLink ? 0.9 : 0.75,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
    />
  );
}
