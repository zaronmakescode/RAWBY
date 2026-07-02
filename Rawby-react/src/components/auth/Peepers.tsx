// The login peepers — three little blob creatures peeking over the auth
// card. Their eyes follow your cursor; they cover their eyes while you type
// a password, wince and shake when it's wrong, and beam when you get in.
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { create } from "zustand";

export type PeeperMood = "idle" | "sad" | "happy";

interface PeeperState {
  covering: boolean; // password field focused → eyes covered
  peeking: boolean; // show-password toggled → one cheeky eye opens
  mood: PeeperMood;
  setCovering: (v: boolean) => void;
  setPeeking: (v: boolean) => void;
  setMood: (m: PeeperMood) => void;
  /** Flash a mood (sad/happy), then settle back to idle. */
  react: (m: PeeperMood, ms?: number) => void;
}

export const usePeepers = create<PeeperState>((set) => ({
  covering: false,
  peeking: false,
  mood: "idle",
  setCovering: (covering) => set({ covering }),
  setPeeking: (peeking) => set({ peeking }),
  setMood: (mood) => set({ mood }),
  react: (mood, ms = 2000) => {
    set({ mood });
    if (mood !== "idle") setTimeout(() => set({ mood: "idle" }), ms);
  },
}));

// Blob palette — accent-driven so they repaint with the theme.
const BLOBS = [
  { w: 46, h: 40, fill: "rgb(var(--c-400))", delay: 0 },
  { w: 58, h: 52, fill: "rgb(var(--c-500))", delay: 0.08 },
  { w: 42, h: 34, fill: "rgb(var(--c-600))", delay: 0.16 },
];

function Eye({
  covering,
  mood,
  pupilRef,
}: {
  covering: boolean; // false on a peeking eye even while the others hide
  mood: PeeperMood;
  pupilRef: (el: HTMLSpanElement | null) => void;
}) {
  if (mood === "happy" && !covering) {
    // Closed happy arc (∩)
    return (
      <span className="flex h-[10px] w-[9px] items-center justify-center">
        <span className="h-[5px] w-[8px] rounded-t-full border-2 border-b-0 border-[#16161a]" />
      </span>
    );
  }
  return (
    <span className="relative flex h-[10px] w-[9px] items-center justify-center overflow-hidden rounded-full bg-white/95">
      <span
        ref={pupilRef}
        className={`h-[4px] w-[4px] rounded-full bg-[#16161a] ${mood === "sad" ? "translate-y-[2px]" : ""}`}
        style={{ transition: "transform 80ms linear" }}
      />
      {/* eyelid — slides down while a password is being typed */}
      <span
        className="absolute inset-x-0 top-0 rounded-b-sm bg-[#16161a]/80"
        style={{
          height: covering ? "100%" : "0%",
          transition: "height 180ms cubic-bezier(0.22,1,0.36,1)",
        }}
      />
    </span>
  );
}

export function Peepers() {
  const covering = usePeepers((s) => s.covering);
  const peeking = usePeepers((s) => s.peeking);
  const mood = usePeepers((s) => s.mood);
  const pupils = useRef<(HTMLSpanElement | null)[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  // One listener steers every pupil.
  useEffect(() => {
    let raf = 0;
    let target = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      target = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(apply);
    };
    function apply() {
      raf = 0;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = target.x - cx;
      const dy = target.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      const x = (dx / d) * 2;
      const y = (dy / d) * 2;
      for (const p of pupils.current) {
        if (p) p.style.transform = `translate(${x}px, ${y}px)`;
      }
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  let pupilIdx = 0;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute -top-[30px] left-7 flex items-end gap-1.5"
    >
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          initial={{ y: 46, opacity: 0 }}
          animate={{
            y: covering ? 12 : mood === "sad" ? 6 : 0,
            x: mood === "sad" ? [0, -4, 4, -3, 3, 0] : 0,
            opacity: 1,
          }}
          transition={{
            y: { type: "spring", stiffness: 240, damping: 18, delay: b.delay },
            x: { duration: 0.45 },
            opacity: { duration: 0.3, delay: b.delay },
          }}
          className="relative flex items-start justify-center"
          style={{
            width: b.w,
            height: b.h,
            background: b.fill,
            borderRadius: `${b.w / 2}px ${b.w / 2}px 6px 6px`,
            boxShadow: "inset 0 -8px 12px rgb(0 0 0 / 0.18), 0 2px 6px rgb(0 0 0 / 0.25)",
          }}
        >
          <span className="mt-[9px] flex gap-[5px]">
            {/* show-password toggled? the middle blob can't resist one peek */}
            <Eye
              covering={covering && !(peeking && i === 1)}
              mood={mood}
              pupilRef={(el) => (pupils.current[pupilIdx++] = el)}
            />
            <Eye
              covering={covering}
              mood={mood}
              pupilRef={(el) => (pupils.current[pupilIdx++] = el)}
            />
          </span>
          {/* happy blush */}
          {mood === "happy" && !covering && (
            <>
              <span className="absolute left-[5px] top-[18px] h-[4px] w-[7px] rounded-full bg-white/25" />
              <span className="absolute right-[5px] top-[18px] h-[4px] w-[7px] rounded-full bg-white/25" />
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}
