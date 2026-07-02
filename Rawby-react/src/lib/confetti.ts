// Tiny hand-rolled confetti — no dependency. Fires a burst of accent-coloured
// paper from the bottom-centre of the viewport, then cleans up after itself.
// Respects prefers-reduced-motion (no-op).

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  life: number; // 1 → 0
}

function accentColors(): string[] {
  const cs = getComputedStyle(document.documentElement);
  const grab = (v: string) => cs.getPropertyValue(v).trim();
  return [
    `rgb(${grab("--c-300")})`,
    `rgb(${grab("--c-400")})`,
    `rgb(${grab("--c-500")})`,
    `rgb(${grab("--c-600")})`,
    "rgba(255,255,255,0.9)",
  ];
}

export function fireConfetti(count = 120) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "70",
  } as CSSStyleDeclaration);
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const colors = accentColors();
  const W = window.innerWidth;
  const H = window.innerHeight;
  const parts: Particle[] = Array.from({ length: count }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5; // up-ish fan
    const speed = 9 + Math.random() * 10;
    return {
      x: W / 2 + (Math.random() - 0.5) * W * 0.28,
      y: H * 0.82,
      vx: Math.cos(angle) * speed * (0.6 + Math.random() * 0.6),
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      w: 5 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    };
  });

  let last = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    const dt = Math.min(32, now - last) / 16.667; // normalise to ~60fps steps
    last = now;
    ctx.clearRect(0, 0, W, H);
    let alive = 0;
    for (const p of parts) {
      p.vy += 0.42 * dt; // gravity
      p.vx *= 0.985; // drag
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.life -= 0.007 * dt;
      if (p.life <= 0 || p.y > H + 30) continue;
      alive++;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      // slight fold shimmer via scale wobble
      ctx.scale(1, 0.6 + Math.abs(Math.sin(p.rot * 2)) * 0.4);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive > 0) raf = requestAnimationFrame(tick);
    else {
      cancelAnimationFrame(raf);
      canvas.remove();
    }
  };
  raf = requestAnimationFrame(tick);

  // Hard stop safety — never linger past 4s.
  setTimeout(() => {
    cancelAnimationFrame(raf);
    canvas.remove();
  }, 4000);
}
