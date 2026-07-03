// Aurora's chat head — a glass bubble with big expressive eyes that follow
// your cursor. Click to open her chat panel. Moods: idle (wander + blink),
// hover (happy arcs), urgent (worried brows + amber pulse when the deadline
// is inside 24h), open (soft content arcs while the panel is up).
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../../store/settings";
import { useMe } from "../../hooks/queries";
import { daysUntilCycleEnd } from "../../lib/constants";

const MAX_SHIFT = 7; // px a pupil may travel from centre — big enough to SEE

export function AuroraBuddy({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const { pathname } = useLocation();
  const reduceMotion = useSettings((s) => s.reduceMotion);
  const cycleDay = useSettings((s) => s.cycleDay);
  const { data } = useMe();
  const wrapRef = useRef<HTMLButtonElement>(null);
  const leftPupil = useRef<HTMLSpanElement>(null);
  const rightPupil = useRef<HTMLSpanElement>(null);
  const [blink, setBlink] = useState(false);

  // Deadline breathing down your neck? Worried brows + amber pulse.
  const snap = data?.snapshot;
  const holiday = !!(snap?.filmingStartedAt && snap?.filmingDeadline);
  const urgent = !!snap?.promptText && !holiday && daysUntilCycleEnd(cycleDay) <= 1;

  // Pupils chase the cursor (rAF-throttled, no React re-renders).
  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;
    let target = { x: 0, y: 0 };
    let hasCursor = false;

    const onMove = (e: MouseEvent) => {
      hasCursor = true;
      target = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(apply);
    };

    function apply() {
      raf = 0;
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = target.x - cx;
      const dy = target.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      // Full deflection toward the cursor — the follow should be unmistakable.
      const x = (dx / d) * MAX_SHIFT;
      const y = (dy / d) * MAX_SHIFT;
      for (const p of [leftPupil.current, rightPupil.current]) {
        if (p) p.style.transform = `translate(${x}px, ${y}px)`;
      }
    }

    // No cursor (touch)? Let the eyes wander now and then.
    const wander = setInterval(() => {
      if (hasCursor) return;
      const a = Math.random() * Math.PI * 2;
      const m = MAX_SHIFT * (0.4 + Math.random() * 0.6);
      for (const p of [leftPupil.current, rightPupil.current]) {
        if (p) p.style.transform = `translate(${Math.cos(a) * m}px, ${Math.sin(a) * m}px)`;
      }
    }, 2200);

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      clearInterval(wander);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  // Random blinks.
  useEffect(() => {
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        setTimeout(() => alive && setBlink(false), 130);
        loop();
      }, 2800 + Math.random() * 3400);
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  const hidden = pathname === "/assistant";
  // Arcs only while the panel is open — on hover the eyes keep tracking
  // (turning them into arcs exactly when you look at them read as "broken").
  const happy = open;

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.button
          ref={wrapRef}
          key="aurora-buddy"
          initial={{ opacity: 0, scale: 0, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggle}
          aria-label={open ? "Close Aurora chat" : "Chat with Aurora"}
          aria-expanded={open}
          className="group fixed bottom-24 right-3 z-modal flex h-[72px] w-[72px] items-center justify-center rounded-full border border-white/[0.08] bg-[rgb(var(--dock))] shadow-[0_10px_30px_-10px_rgb(var(--c-500)/0.5)] backdrop-blur-md md:bottom-8 md:right-6"
        >
          {/* soft accent halo */}
          <span
            className="pointer-events-none absolute inset-0 rounded-full opacity-60 transition-opacity duration-300 group-hover:opacity-100"
            style={{ boxShadow: "inset 0 0 18px rgb(var(--c-500) / 0.24)" }}
          />
          {/* deadline pulse — under 24h on an active prompt */}
          {urgent && !reduceMotion && !open && (
            <span className="pointer-events-none absolute inset-0 animate-ping rounded-full border-2 border-cinema-500/50" />
          )}

          {/* face */}
          <span className="relative flex items-center gap-2">
            {/* worried brows when the clock is tight */}
            {urgent && !happy && (
              <>
                <span className="absolute -top-2.5 left-[1px] h-[2.5px] w-[13px] -rotate-[14deg] rounded-full bg-text-hi/80" />
                <span className="absolute -top-2.5 right-[1px] h-[2.5px] w-[13px] rotate-[14deg] rounded-full bg-text-hi/80" />
              </>
            )}
            {[leftPupil, rightPupil].map((ref, i) =>
              happy ? (
                // closed happy arcs (∩)
                <span key={i} className="flex h-[26px] w-[18px] items-end justify-center pb-[6px]">
                  <span className="h-[9px] w-[15px] rounded-t-full border-[3px] border-b-0 border-text-hi" />
                </span>
              ) : (
                <span
                  key={i}
                  className="relative flex h-[28px] w-[20px] items-center justify-center overflow-hidden rounded-full bg-white transition-transform duration-100"
                  style={{ transform: blink ? "scaleY(0.1)" : "scaleY(1)" }}
                >
                  <span
                    ref={ref}
                    className="h-[11px] w-[11px] rounded-full bg-[#1c1a17]"
                    style={{ transition: "transform 70ms linear" }}
                  />
                  {/* eye shine */}
                  <span className="pointer-events-none absolute left-[4px] top-[6px] h-[3px] w-[3px] rounded-full bg-white/80" />
                </span>
              )
            )}
          </span>

          {/* name tag on hover */}
          <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-hairline bg-[rgb(var(--surface))] px-2.5 py-1 text-[11px] font-semibold text-text-hi opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
            {urgent ? "Deadline's close — talk to me" : "Aurora"}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
