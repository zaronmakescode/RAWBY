// Hand-rolled SVG world map (no map library). Equirectangular projection —
// dots mark where films were shot; interactive mode turns clicks into
// lat/lng picks (used by the submit-film location picker).
import { useRef, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { WORLD_PATH, MAP_W, project, unproject } from "../lib/worldMap";

export interface MapPin {
  lat: number;
  lng: number;
  /** Place name, shown under the title in the tooltip. */
  label?: string;
  /** Film title, shown as the tooltip headline. */
  title?: string;
  id?: string;
}

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

export function WorldMap({ pins = [], interactive = false, onPick, onPinClick, className = "" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  function handleClick(e: MouseEvent<SVGSVGElement>) {
    if (!interactive || !onPick || !svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const { x, y } = pt.matrixTransform(ctm.inverse());
    const { lat, lng } = unproject(x, y);
    if (lat > 90 || lat < -90 || lng > 180 || lng < -180) return;
    onPick(lat, lng);
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 ${VIEW_Y} ${MAP_W} ${VIEW_H}`}
      className={`block w-full ${interactive ? "cursor-crosshair" : ""} ${className}`}
      onClick={handleClick}
      role={interactive ? "button" : "img"}
      aria-label={interactive ? "World map — click to drop a pin" : "World map of your films"}
    >
      {/* faint graticule */}
      <g stroke="rgb(var(--hairline))" strokeWidth="0.5">
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
        strokeWidth="0.5"
        strokeLinejoin="round"
      />

      {/* film pins */}
      {pins.map((p, i) => {
        const [x, y] = project(p.lat, p.lng);
        const tip = [p.title, p.label].filter(Boolean).join(" — ");
        return (
          <motion.g
            key={p.id ?? `${p.lat},${p.lng},${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05, type: "spring", stiffness: 260, damping: 18 }}
            style={{ transformOrigin: `${x}px ${y}px` }}
            className={onPinClick ? "cursor-pointer" : ""}
            onClick={(e) => {
              if (!onPinClick) return;
              e.stopPropagation();
              onPinClick(p);
            }}
          >
            {tip && <title>{tip}</title>}
            <circle cx={x} cy={y} r="9" fill="rgb(var(--c-500) / 0.16)" />
            <circle cx={x} cy={y} r="4.5" fill="rgb(var(--c-500) / 0.45)" />
            <circle cx={x} cy={y} r="2.4" fill="rgb(var(--c-500))" stroke="rgb(var(--bg))" strokeWidth="0.8" />
          </motion.g>
        );
      })}
    </svg>
  );
}
