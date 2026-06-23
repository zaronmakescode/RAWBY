// Hand-drawn underline — a slightly irregular stroke that draws itself in.
// The imperfection is the point: it reads as a marker pass, not a CSS border.
import { motion } from "framer-motion";

export function Scribble({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="100%"
      height="14"
      viewBox="0 0 300 14"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        d="M2 9.5 C 40 4, 78 12, 120 7.5 S 200 3, 248 8 S 290 6, 298 5"
        stroke="rgb(var(--c-500))"
        strokeWidth="3.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
      />
    </svg>
  );
}
