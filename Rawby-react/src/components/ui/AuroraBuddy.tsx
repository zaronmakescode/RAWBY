// Aurora's floating chat head — a little glass bubble with a pair of eyes
// that follow your cursor around the app. Click it to open the assistant.
// On touch devices (no cursor) the eyes wander on their own. Blinks too.
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../../store/settings";
import { useMe } from "../../hooks/queries";
import { daysUntilCycleEnd } from "../../lib/constants";

const MAX_SHIFT = 3.2; // px a pupil may travel from centre

export function AuroraBuddy() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const reduceMotion = useSettings((s) => s.reduceMotion);
  const cycleDay = useSettings((s) => s.cycleDay);
  const { data } = useMe();

  // Deadline breathing down your neck? The bubble pulses amber.
  const snap = data?.snapshot;
  const holiday = !!(snap?.filmingStartedAt && snap?.filmingDeadline);
  const urgent = !!snap?.promptText && !holiday && daysUntilCycleEnd(cycleDay) <= 1;
  const wrapRef = useRef<HTMLButtonElement>(null);
  const leftPupil = useRef<HTMLSpanElement>(null);
  const rightPupil = useRef<HTMLSpanElement>(null);
  const [blink, setBlink] = useState(false);

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
      const k = Math.min(1, d / 90); // nearby cursor → subtler shift
      const x = (dx / d) * MAX_SHIFT * k;
      const y = (dy / d) * MAX_SHIFT * k;
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
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => nav("/assistant")}
          aria-label="Chat with Aurora"
          title={urgent ? "Deadline's close — ask Aurora" : "Aurora"}
          className="group fixed bottom-24 right-4 z-nav flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.08] bg-[rgb(var(--dock))] shadow-[0_8px_24px_-8px_rgb(var(--c-500)/0.45)] backdrop-blur-md md:bottom-8 md:right-6"
        >
          {/* soft accent halo */}
          <span
            className="pointer-events-none absolute inset-0 rounded-full opacity-60 transition-opacity duration-300 group-hover:opacity-100"
            style={{ boxShadow: "inset 0 0 14px rgb(var(--c-500) / 0.22)" }}
          />
          {/* deadline pulse — under 24h on an active prompt */}
          {urgent && !reduceMotion && (
            <span className="pointer-events-none absolute inset-0 animate-ping rounded-full border-2 border-cinema-500/50" />
          )}
          {/* eyes */}
          <span className="flex items-center gap-1.5">
            {[leftPupil, rightPupil].map((ref, i) => (
              <span
                key={i}
                className="relative flex h-[18px] w-[13px] items-center justify-center overflow-hidden rounded-full bg-text-hi transition-transform duration-100"
                style={{ transform: blink ? "scaleY(0.12)" : "scaleY(1)" }}
              >
                <span
                  ref={ref}
                  className="h-[7px] w-[7px] rounded-full"
                  style={{ background: "rgb(var(--c-600))", transition: "transform 80ms linear" }}
                />
              </span>
            ))}
          </span>
          {/* tiny sparkle on hover */}
          <span className="pointer-events-none absolute -right-0.5 -top-0.5 text-[10px] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            ✦
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
