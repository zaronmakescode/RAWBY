import { useEffect, useState } from "react";
import { useMotionValue, animate } from "framer-motion";

/**
 * Animates a number from 0 → value on mount / when value changes.
 * Single value, no stagger — safe from the entrance-freeze pattern.
 */
export function CountUp({
  value,
  prefix = "",
  format,
}: {
  value: number;
  prefix?: string;
  format?: (n: number) => string;
}) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const n = Math.round(display);
  return (
    <>
      {prefix}
      {format ? format(n) : n}
    </>
  );
}
