import { type CSSProperties, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Props {
  lightWidth?: number;
  duration?: number;
  lightColor?: string;
  borderWidth?: number;
  className?: string;
}

/**
 * A point of light that travels around a card's border — adapted from a
 * 21st.dev "Border Beam" component, defaulted to RAWBY gold. Drop inside any
 * `relative` rounded container. Purely decorative.
 */
export function BorderBeam({
  lightWidth = 220,
  duration = 9,
  lightColor = "#F0C868",
  borderWidth = 1,
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setPath = () => {
      const el = ref.current;
      if (!el) return;
      el.style.setProperty("--path", `path("M 0 0 H ${el.offsetWidth} V ${el.offsetHeight} H 0 V 0")`);
    };
    setPath();
    window.addEventListener("resize", setPath);
    return () => window.removeEventListener("resize", setPath);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ "--border-width": `${borderWidth}px` } as CSSProperties}
      className={`pointer-events-none absolute inset-0 z-0 h-full w-full rounded-[inherit] border-[length:var(--border-width)] border-transparent ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] ${className}`}
    >
      <motion.div
        className="absolute inset-0 aspect-square bg-[radial-gradient(ellipse_at_center,var(--light-color),transparent,60%)]"
        style={{ "--light-color": lightColor, width: `${lightWidth}px`, offsetPath: "var(--path)" } as CSSProperties}
        animate={{ offsetDistance: ["0%", "100%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
