// Hand-rolled SVG world map (no map library). Equirectangular projection.
// Zoom (wheel / pinch / double-click / buttons, up to 40×), pan (drag), and
// auto-framing that fits the content on load so you never have to hunt for a
// country. Accent dots = films, teal diamonds = shared shooting spots.
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as RPointerEvent,
} from "react";
import { WORLD_PATH, MAP_W, project, unproject } from "../lib/worldMap";
import { Icon } from "./ui/Icon";

export interface MapPin {
  lat: number;
  lng: number;
  label?: string; // place name (tooltip subline)
  title?: string; // film title / spot name (tooltip headline)
  id?: string;
  kind?: "film" | "spot"; // film = accent dot, spot = teal diamond
}

const SPOT_COLOR = "#4fc3a1"; // shared shooting spots — distinct from any accent

interface Props {
  pins?: MapPin[];
  interactive?: boolean; // clicks drop a lat/lng pin
  onPick?: (lat: number, lng: number) => void;
  onPinClick?: (pin: MapPin) => void;
  className?: string;
}

// Crop the empty poles: show lat 85°N … 60°S of the 720x360 projection.
const VIEW_Y = 10;
const VIEW_H = 290;
const RATIO = MAP_W / VIEW_H;
const MIN_W = MAP_W / 40; // 40× max zoom
const MIN_FIT_W = 26; // don't slam all the way in when framing a tight cluster
const DRAG_EPS = 5; // px of screen movement that turns a click into a drag
const SPOT_GATE_COUNT = 30; // big packs hide until you zoom past…
const SPOT_GATE_W = MAP_W / 3.5; // …this view width

interface VB { x: number; y: number; w: number; h: number }
const WORLD: VB = { x: 0, y: VIEW_Y, w: MAP_W, h: VIEW_H };

function clampVb(vb: VB): VB {
  const w = Math.min(MAP_W, Math.max(MIN_W, vb.w));
  const h = w / RATIO;
  const x = Math.min(MAP_W - w, Math.max(0, vb.x));
  const y = Math.min(VIEW_Y + VIEW_H - h, Math.max(VIEW_Y, vb.y));
  return { x, y, w, h };
}

/** Frame a set of pins with padding — the view you get on load / reset. */
function fitVb(pins: MapPin[]): VB {
  if (pins.length === 0) return WORLD;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pins) {
    const [x, y] = project(p.lat, p.lng);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  // width driven by the wider of the two axes (kept to the map ratio), + 55% pad
  let w = Math.max((maxX - minX) * 1.55, (maxY - minY) * RATIO * 1.55, MIN_FIT_W);
  w = Math.min(w, MAP_W);
  return clampVb({ x: cx - w / 2, y: cy - w / RATIO / 2, w, h: w / RATIO });
}

export function WorldMap({ pins = [], interactive = false, onPick, onPinClick, className = "" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const initial = useMemo(() => (interactive ? WORLD : fitVb(pins.length ? pins : [])), []); // eslint-disable-line
  const [vb, setVb] = useState<VB>(initial);
  const vbRef = useRef(vb);
  vbRef.current = vb;
  const [hover, setHover] = useState<{ pin: MapPin; x: number; y: number } | null>(null);

  // Re-frame once when async pins (films/spots) arrive and we're still at the
  // default view — so the Atlas opens already centred on where the pins are.
  const framed = useRef(false);
  useLayoutEffect(() => {
    if (interactive || framed.current || pins.length === 0) return;
    framed.current = true;
    setVb(fitVb(pins));
  }, [pins, interactive]);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const dragging = useRef(false);
  const moved = useRef(0);
  const pinchStart = useRef<{ dist: number; vb: VB } | null>(null);

  /** Screen point → map coords (null while the svg has no measurable size). */
  function toMap(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    const cur = vbRef.current;
    return {
      x: cur.x + ((clientX - r.left) / r.width) * cur.w,
      y: cur.y + ((clientY - r.top) / r.height) * cur.h,
    };
  }

  function zoomAt(clientX: number, clientY: number, factor: number) {
    const p = toMap(clientX, clientY);
    if (!p) return;
    setVb((cur) => {
      const w = Math.min(MAP_W, Math.max(MIN_W, cur.w / factor));
      const k = w / cur.w;
      return clampVb({ x: p.x - (p.x - cur.x) * k, y: p.y - (p.y - cur.y) * k, w, h: cur.h * k });
    });
  }

  function zoomCenter(factor: number) {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    zoomAt(r.left + r.width / 2, r.top + r.height / 2, factor);
  }

  // Wheel must be a NON-passive native listener — React's onWheel is passive,
  // so preventDefault there is ignored and the page scrolls instead of zooming.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.pow(1.0016, -e.deltaY); // smooth, trackpad-friendly
      zoomAt(e.clientX, e.clientY, factor);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  function onPointerDown(e: RPointerEvent<SVGSVGElement>) {
    svgRef.current?.setPointerCapture?.(e.pointerId); // capture on the svg, not the pin
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = 0;
    dragging.current = false;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), vb: vbRef.current };
    }
  }

  function onPointerMove(e: RPointerEvent<SVGSVGElement>) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);

    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const factor = dist / pinchStart.current.dist;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const r = svgRef.current!.getBoundingClientRect();
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
    if (moved.current > DRAG_EPS) {
      dragging.current = true;
      setHover(null);
      const r = svgRef.current!.getBoundingClientRect();
      setVb((c) => clampVb({ ...c, x: c.x - dx * (c.w / r.width), y: c.y - dy * (c.h / r.height) }));
    }
  }

  function onPointerUp(e: RPointerEvent<SVGSVGElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (!dragging.current && moved.current <= DRAG_EPS && interactive && onPick) {
      const p = toMap(e.clientX, e.clientY);
      if (p) {
        const { lat, lng } = unproject(p.x, p.y);
        if (lat <= 90 && lat >= -90 && lng <= 180 && lng >= -180) onPick(lat, lng);
      }
    }
    if (pointers.current.size === 0) dragging.current = false;
  }

  // Pins keep a readable on-screen size at any zoom.
  const pinScale = Math.max(0.1, Math.sqrt(vb.w / MAP_W));

  // Big spot packs hide until you zoom in; films always show.
  const spotCount = pins.reduce((n, p) => n + (p.kind === "spot" ? 1 : 0), 0);
  const spotsGated = spotCount > SPOT_GATE_COUNT && vb.w > SPOT_GATE_W;
  const visiblePins = spotsGated ? pins.filter((p) => p.kind !== "spot") : pins;

  const btn =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-[rgb(var(--surface))] text-text-dim transition-colors hover:text-text-hi hover:border-hairline-strong";

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        className={`block w-full touch-none select-none ${
          dragging.current ? "cursor-grabbing" : interactive ? "cursor-crosshair" : "cursor-grab"
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={(e) => zoomAt(e.clientX, e.clientY, 2)}
        role={interactive ? "button" : "img"}
        aria-label={
          interactive ? "Click to drop a pin. Drag to pan, scroll to zoom." : "World map of shooting spots"
        }
      >
        {/* faint graticule */}
        <g stroke="rgb(var(--hairline))" strokeWidth={0.4 * pinScale}>
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
          fill="rgb(var(--text-dim) / 0.14)"
          stroke="rgb(var(--text-dim) / 0.26)"
          strokeWidth={0.4 * pinScale}
          strokeLinejoin="round"
        />

        {/* pins */}
        {visiblePins.map((p, i) => {
          const [x, y] = project(p.lat, p.lng);
          const s = pinScale;
          const hovered = hover?.pin === p;
          return (
            <g
              key={p.id ?? `${p.lat},${p.lng},${i}`}
              className={onPinClick ? "cursor-pointer" : "cursor-default"}
              onPointerEnter={(e) => !dragging.current && setHover({ pin: p, x: e.clientX, y: e.clientY })}
              onPointerMove={(e) => hovered && setHover({ pin: p, x: e.clientX, y: e.clientY })}
              onPointerLeave={() => setHover((h) => (h?.pin === p ? null : h))}
              onClick={(e) => {
                if (!onPinClick || dragging.current || moved.current > DRAG_EPS) return;
                e.stopPropagation();
                onPinClick(p);
              }}
            >
              {p.kind === "spot" ? (
                <>
                  <circle cx={x} cy={y} r={(hovered ? 10 : 7) * s} fill={SPOT_COLOR} opacity={hovered ? 0.28 : 0.14} />
                  <rect
                    x={x - 3 * s} y={y - 3 * s} width={6 * s} height={6 * s}
                    transform={`rotate(45 ${x} ${y})`}
                    fill={SPOT_COLOR} stroke="rgb(var(--bg))" strokeWidth={0.7 * s}
                  />
                </>
              ) : (
                <>
                  <circle cx={x} cy={y} r={(hovered ? 12 : 9) * s} fill="rgb(var(--c-500) / 0.16)" />
                  <circle cx={x} cy={y} r={4.5 * s} fill="rgb(var(--c-500) / 0.45)" />
                  <circle cx={x} cy={y} r={2.4 * s} fill="rgb(var(--c-500))" stroke="rgb(var(--bg))" strokeWidth={0.7 * s} />
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* hover tooltip — instant HTML card, not a laggy native title */}
      {hover && (
        <div
          className="pointer-events-none fixed z-modal max-w-[220px] -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-lg border border-hairline bg-[rgb(var(--surface))] px-2.5 py-1.5 text-xs shadow-lg"
          style={{ left: hover.x, top: hover.y }}
        >
          <div className="flex items-center gap-1.5 font-semibold text-text-hi">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: hover.pin.kind === "spot" ? SPOT_COLOR : "rgb(var(--c-500))" }}
            />
            <span className="truncate">{hover.pin.title ?? "Pinned"}</span>
          </div>
          {hover.pin.label && <div className="mt-0.5 text-text-dim">{hover.pin.label}</div>}
        </div>
      )}

      {/* gated-spots hint */}
      {spotsGated && (
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-full border border-hairline bg-[rgb(var(--surface))] px-2.5 py-1 text-[10px] font-semibold text-text-dim">
          {spotCount} spots · zoom in
        </div>
      )}

      {/* controls */}
      <div className="absolute bottom-2 right-2 flex flex-col gap-1">
        <button type="button" aria-label="Zoom in" onClick={() => zoomCenter(1.6)} className={btn}>
          <Icon name="plus" size={14} />
        </button>
        <button type="button" aria-label="Zoom out" onClick={() => zoomCenter(1 / 1.6)} className={btn}>
          <span className="mb-0.5 text-base font-bold leading-none">−</span>
        </button>
        <button
          type="button"
          aria-label="Fit to pins"
          title="Frame everything"
          onClick={() => setVb(fitVb(pins.length ? pins : []))}
          className={btn}
        >
          <Icon name="aperture" size={14} />
        </button>
      </div>
    </div>
  );
}
