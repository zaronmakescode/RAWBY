import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode, type MouseEvent } from "react";

type Props = Omit<HTMLMotionProps<"div">, "children"> & {
  /** Adds hover lift + pointer (transform/shadow only — no layout shift). */
  interactive?: boolean;
  /** Cursor-follow glow. Defaults on for interactive cards. */
  spotlight?: boolean;
  children?: ReactNode;
};

export const GlassCard = forwardRef<HTMLDivElement, Props>(
  ({ className = "", interactive = false, spotlight, children, onMouseMove, ...rest }, ref) => {
    const useSpot = spotlight ?? interactive;
    const handleMove = (e: MouseEvent<HTMLDivElement>) => {
      if (useSpot) {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      }
      onMouseMove?.(e);
    };
    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        className={`glass p-5 ${interactive ? "card-hover" : ""} ${useSpot ? "spotlight" : ""} ${className}`}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";
