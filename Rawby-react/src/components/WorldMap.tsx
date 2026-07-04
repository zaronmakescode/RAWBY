// Hand-rolled SVG world map (no map library). Equirectangular projection.
// Zoomable (wheel / pinch / buttons, up to 8×) and pannable (drag). Dots
// mark films, teal diamonds mark shared shooting spots; interactive mode
// turns clicks into lat/lng picks.
import { useRef, useState, type PointerEvent as RPointerEvent, type WheelEvent as RWheelEvent } from "react";
import { motion } from "framer-motion";
import { WORLD_PATH, MAP_W, project, unproject } from "../lib/worldMap";
import { Icon } from "./ui/Icon";

export interface MapPin {
  lat: number;
  lng: number;
  /** Place name, shown under the title in the tooltip. */
  label?: string;
  /** Film title, shown as the tooltip headline. */
  title?: string;
  id?: string;
  /** "film" (default) = accent dot. "spot" = teal diamond (shared shooting spot). */
  kind?: "film" | "spot";
}

const SPOT_COLOR = "#4fc3a1"; // shared shooting spots — distinct from any accent

interface Props {
  pins?: MapPin[];
  /** Clicks pick a lat/lng (drop-a-pin mode). */
  interactive?: boolean;
  onPick?: (lat: number, lng: number) => void;
  onPinClick?: (pin: MapPin) => void;
  className?: string;
}

// Crop the empty poles: show lat 85°N … 60°S of the 720x360 projection.
const VIEW_Y = 10;
const VIEW_H = 290;
const MIN_W = MAP_W / 40; // 40× max zoom — enough to navigate one country's spots
const DRAG_EPS = 5; // px of screen movement that turns a click into a drag
// With a big curated pack, spot pins only render once you're zoomed in —
// otherwise a whole country collapses into one blob of diamonds.
const SPOT_GATE_COUNT = 30;
const SPOT_GATE_W = MAP_W / 4;

interface VB { x: number; y: number; w: number; h: number }
const HOME: VB = { x: 0, y: VIEW_Y, w: MAP_W, h: VIEW_H };

function clampVb(vb: VB): VB {
  const w = Math.min(MAP_W, Math.max(MIN_W, vb.w));
  const h = (w / MAP_W) * VIEW_H;
  const x = Math.min(MAP_W - w, Math.max(0, vb.x));
  const y = Math.min(VIEW_Y + VIEW_H - h, Math.max(VIEW_Y, vb.y));
  return { x, y, w, h };
}

export function WorldMap({ pins = [], interactive = false, onPick, onPinClick, className = "" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [vb, setVb] = useState<VB>(HOME);
  const zoomed = vb.w < MAP_W - 0.5;

  // Gesture state (refs — no re-render churn while dragging)
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const dragging = useRef(false);
  const moved = useRef(0);
  const pinchStart = useRef<{ dist: number; vb: VB } | null>(null);

  /** Screen point → current viewBox coordinates (null while unmeasurable). */
  function toMap(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return null; // hidden/zero-size → no math on it
    return {
      x: vb.x + ((clientX - r.left) / r.width) * vb.w,
      y: vb.y + ((clientY - r.top) / r.height) * vb.h,
    };
  }

  function zoomAt(clientX: number, clientY: number, factor: number) {
    const p = toMap(clientX, clientY);
    if (!p) return;
    setVb((cur) => {
      const w = Math.min(MAP_W, Math.max(MIN_W, cur.w / factor));
      const k = w / cur.w;
      return clampVb({
        x: p.x - (p.x - cur.x) * k,
        y: p.y - (p.y - cur.y) * k,
        w,
        h: cur.h * k,
      });
    });
  }

  function onWheel(e: RWheelEvent<SVGSVGElement>) {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.25 : 0.8);
  }

  function onPointerDown(e: RPointerEvent<SVGSVGElement>) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = 0;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), vb };
    }
  }

  function onPointerMove(e: RPointerEvent<SVGSVGElement>) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);

    if (pointers.current.size === 2 && pinchStart.current) {
      // pinch zoom toward the midpoint
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const factor = dist / pinchStart.current.dist;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const svg = svgRef.current!;
      const r = svg.getBoundingClientRect();
      const s = pinchStart.current.vb;
      const px = s.x + ((mid.x - r.left) / r.width) * s.w;
      const py = s.y + ((mid.y - r.top) / r.height) * s.h;
      const w = Math.min(MAP_W, Math.max(MIN_W, s.w / factor));
      const k = w / s.w;
      setVb(clampVb({ x: px - (px - s.x) * k, y: py - (py - s.y) * k, w, h: s.h * k }));
      return;
    }

    const dx = cur.x - prev.x;
    const dy = cur.y - prev.y;
    moved.current += Math.abs(dx) + Math.abs(dy);
    if (moved.current > DRAG_EPS && zoomed) {
      dragging.current = true;
      const svg = svgRef.current!;
      const r = svg.getBoundingClientRect();
      setVb((c) =>
        clampVb({ ...c, x: c.x - dx * (c.w / r.width), y: c.y - dy * (c.h / r.height) })
      );
    }
  }

  function onPointerUp(e: RPointerEvent<SVGSVGElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    // click (not drag) → pick
    if (!dragging.current && moved.current <= DRAG_EPS && interactive && onPick) {
      const p = toMap(e.clientX, e.clientY);
      if (p) {
        const { lat, lng } = unproject(p.x, p.y);
        if (lat <= 90 && lat >= -90 && lng <= 180 && lng >= -180) onPick(lat, lng);
      }
    }
    if (pointers.current.size === 0) dragging.current = false;
  }

  // Pins keep a sane on-screen size at any zoom.
  const pinScale = Math.max(0.12, Math.sqrt(vb.w / MAP_W));

  // Big spot packs hide until you zoom in; films always show.
  const spotCount = pins.reduce((n, p) => n + (p.kind === "spot" ? 1 : 0), 0);
  const spotsGated = spotCount > SPOT_GATE_COUNT && vb.w > SPOT_GATE_W;
  const visiblePins = spotsGated ? pins.filter((p) => p.kind !== "spot") : pins;

  return (
    <div className={`relative ${className}`}>
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        className={`block w-full touch-none select-none ${
          dragging.current ? "cursor-grabbing" : interactive ? "cursor-crosshair" : zoomed ? "cursor-grab" : ""
        }`}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role={interactive ? "button" : "img"}
        aria-label={interactive ? "World map — click to drop a pin, drag to pan, scroll to zoom" : "World map"}
      >
        {/* faint graticule */}
        <g stroke="rgb(var(--hairline))" strokeWidth={0.5 * pinScale}>
          {[-120, -60, 0, 60, 120].map((lng) => {
            const [x] = project(0, lng);
            return <line key={`v${lng}`} x1={x} y1={VIEW_Y} x2={x} y2={VIEW_Y + VIEW_H} />;
          })}
          {[60, 30, 0, -30].map((lat) => {
            const [, y] = project(lat, 0);
            return <line key={`h${lat}`} x1={0} y1={y} x2={MAP_W} y2={y} />;
          })}
        </g>

        {/* land */}
        <path
          d={WORLD_PATH}
          fill="rgb(var(--text-dim) / 0.16)"
          stroke="rgb(var(--text-dim) / 0.28)"
          strokeWidth={0.5 * pinScale}
          strokeLinejoin="round"
        />

        {/* pins */}
        {visiblePins.map((p, i) => {
          const [x, y] = project(p.lat, p.lng);
          const tip = [p.title, p.label].filter(Boolean).join(" — ");
          const s = pinScale;
          return (
            <motion.g
              key={p.id ?? `${p.lat},${p.lng},${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + Math.min(i, 20) * 0.03 }}
              className={onPinClick ? "cursor-pointer" : ""}
              onClick={(e) => {
                if (!onPinClick || dragging.current || moved.current > DRAG_EPS) return;
                e.stopPropagation();
                onPinClick(p);
              }}
            >
              {tip && <title>{tip}</title>}
              {p.kind === "spot" ? (
                <>
                  <circle cx={x} cy={y} r={8 * s} fill={SPOT_COLOR} opacity="0.14" />
                  <rect
                    x={x - 3 * s}
                    y={y - 3 * s}
                    width={6 * s}
                    height={6 * s}
                    transform={`rotate(45 ${x} ${y})`}
                    fill={SPOT_COLOR}
                    stroke="rgb(var(--bg))"
                    strokeWidth={0.8 * s}
                  />
                </>
              ) : (
                <>
                  <circle cx={x} cy={y} r={9 * s} fill="rgb(var(--c-500) / 0.16)" />
                  <circle cx={x} cy={y} r={4.5 * s} fill="rgb(var(--c-500) / 0.45)" />
                  <circle cx={x} cy={y} r={2.4 * s} fill="rgb(var(--c-500))" stroke="rgb(var(--bg))" strokeWidth={0.8 * s} />
                </>
              )}
            </motion.g>
          );
        })}
      </svg>

      {/* gated-spots hint */}
      {spotsGated && (
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-full border border-hairline bg-[rgb(var(--surface))] px-2.5 py-1 text-[10px] font-semibold text-text-dim">
          {spotCount} spots — zoom in to see them
        </div>
      )}

      {/* zoom controls */}
      <div className="absolute bottom-2 right-2 flex flex-col gap-1">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => {
            const r = svgRef.current!.getBoundingClientRect();
            zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1.5);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-hairline bg-[rgb(var(--surface))] text-text-dim transition-colors hover:text-text-hi"
        >
          <Icon name="plus" size={13} />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => {
            const r = svgRef.current!.getBoundingClientRect();
            zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1 / 1.5);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-hairline bg-[rgb(var(--surface))] text-text-dim transition-colors hover:text-text-hi"
        >
          <span className="mb-0.5 text-sm font-bold leading-none">−</span>
        </button>
        {zoomed && (
          <button
            type="button"
            aria-label="Reset zoom"
            onClick={() => setVb(HOME)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-hairline bg-[rgb(var(--surface))] text-text-dim transition-colors hover:text-text-hi"
          >
            <Icon name="refresh" size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
