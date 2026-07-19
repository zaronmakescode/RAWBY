// The videography radar — a five-axis chart of your lanes. Each category is an
// axis; the polygon reaches further where you've shot more. The categories of
// your latest film glow at their vertex. Click a chip below to see its films.
// Replaces the old free-floating constellation with a chart that reads at a
// glance and stays calm — colourful in Studio, monochrome in RAW.
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Icon, type IconName } from "./ui/Icon";
import { GlassCard } from "./ui/GlassCard";
import { VIDEO_CATEGORIES } from "../lib/constants";
import { useUiMode } from "../store/uiMode";
import type { ProjectHistoryItem } from "../types";

function statFor(history: ProjectHistoryItem[], id: string) {
  const items = history.filter((h) => h.categories?.includes(id));
  const liked = items.filter((h) => h.likes != null && h.likes > 0);
  const avg = liked.length
    ? Math.round(liked.reduce((s, h) => s + (h.likes ?? 0), 0) / liked.length)
    : null;
  return { count: items.length, avg, items };
}

const W = 460;
const H = 360;
const CX = W / 2;
const CY = H / 2 - 6;
const R = 128; // outer axis length
const RINGS = 4; // concentric grid rings
const N = VIDEO_CATEGORIES.length;
const START = -Math.PI / 2; // first axis points up

/** Vertex position for axis i at fraction t (0 = centre, 1 = outer). */
function point(i: number, t: number): [number, number] {
  const angle = START + (i * 2 * Math.PI) / N;
  return [CX + Math.cos(angle) * R * t, CY + Math.sin(angle) * R * t];
}

function polygon(ts: number[]): string {
  return ts.map((t, i) => point(i, t).join(",")).join(" ");
}

export function CategoryRadar({ history }: { history: ProjectHistoryItem[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const isRaw = useUiMode((s) => s.mode) === "raw";
  // RAW is monochrome — every per-category colour collapses to the neutral accent.
  const tint = (color: string) => (isRaw ? "rgb(var(--c-500))" : color);

  const { nodes, total, lastUsed } = useMemo(() => {
    const stats = VIDEO_CATEGORIES.map((c) => ({ ...c, ...statFor(history, c.id) }));
    const max = Math.max(1, ...stats.map((s) => s.count));
    const latest = history.find((h) => h.categories?.length);
    const last = new Set(latest?.categories ?? []);
    const nodes = stats.map((s, i) => {
      const t = s.count / max; // 0..1 reach along the axis
      const [x, y] = point(i, t);
      const [lx, ly] = point(i, 1);
      return { ...s, t, x, y, labelX: lx, labelY: ly, isLast: last.has(s.id) };
    });
    return { nodes, total: history.length, lastUsed: last };
  }, [history]);

  const active = selected ? nodes.find((n) => n.id === selected) : null;
  const dataPoly = polygon(nodes.map((n) => Math.max(0.02, n.t)));

  return (
    <GlassCard className="p-4 md:p-5">
      <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:gap-6">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mx-auto block w-full max-w-md"
          role="img"
          aria-label="Your videography radar"
        >
          {/* grid rings */}
          {Array.from({ length: RINGS }, (_, r) => {
            const t = (r + 1) / RINGS;
            return (
              <polygon
                key={`ring-${r}`}
                points={polygon(Array(N).fill(t))}
                fill="none"
                stroke="rgb(var(--hairline))"
                strokeWidth={1}
              />
            );
          })}

          {/* axes */}
          {nodes.map((n, i) => (
            <line
              key={`axis-${i}`}
              x1={CX}
              y1={CY}
              x2={n.labelX}
              y2={n.labelY}
              stroke="rgb(var(--hairline))"
              strokeWidth={1}
            />
          ))}

          {/* data polygon */}
          <motion.polygon
            points={dataPoly}
            fill="rgb(var(--c-500) / 0.14)"
            stroke="rgb(var(--c-500))"
            strokeWidth={1.75}
            strokeLinejoin="round"
            initial={reduce ? false : { opacity: 0, scale: 0.6 }}
            whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />

          {/* vertices + labels */}
          {nodes.map((n, i) => {
            const isSel = selected === n.id;
            const dim = n.count === 0;
            // Nudge label off the axis end so it clears the ring.
            const dx = n.labelX - CX;
            const dy = n.labelY - CY;
            const anchor = Math.abs(dx) < 12 ? "middle" : dx > 0 ? "start" : "end";
            const lx = n.labelX + Math.sign(dx) * (anchor === "middle" ? 0 : 8);
            const ly = n.labelY + (Math.abs(dy) < 12 ? (dy < 0 ? -10 : 16) : dy > 0 ? 12 : -4);
            return (
              <g key={n.id}>
                {n.isLast && !dim && (
                  <circle cx={n.x} cy={n.y} r={9} fill={tint(n.color)} opacity={0.18} />
                )}
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r={isSel ? 6 : dim ? 3 : 5}
                  fill={dim ? "rgb(var(--chip))" : tint(n.color)}
                  stroke={dim ? "rgb(var(--hairline-strong))" : tint(n.color)}
                  strokeWidth={1}
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={reduce ? undefined : { opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  style={{ transition: "r 150ms ease" }}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor={anchor}
                  className={dim ? "fill-[rgb(var(--text-dim))]" : "fill-[rgb(var(--text-hi))]"}
                  style={{ font: "600 11px Inter, sans-serif" }}
                >
                  {n.label}
                </text>
              </g>
            );
          })}

          {/* centre count */}
          <text
            x={CX}
            y={CY + 4}
            textAnchor="middle"
            className="fill-[rgb(var(--text-dim))]"
            style={{ font: "600 9px Inter, sans-serif", letterSpacing: "0.1em" }}
          >
            {total ? `${total} FILM${total === 1 ? "" : "S"}` : "NO FILMS"}
          </text>
        </svg>

        {/* chips — the click targets + legend */}
        <div className="flex flex-row flex-wrap justify-center gap-1.5 md:flex-col md:justify-start">
          {nodes.map((n) => {
            const isSel = selected === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setSelected((s) => (s === n.id ? null : n.id))}
                aria-pressed={isSel}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSel
                    ? "border-hairline-strong bg-glass-hover text-text-hi"
                    : "border-hairline text-text-dim hover:text-text-hi"
                }`}
              >
                <span style={{ color: n.count ? tint(n.color) : "rgb(var(--text-dim))" }}>
                  <Icon name={n.icon as IconName} size={13} />
                </span>
                <span className="truncate">{n.label}</span>
                <span className="tabular-nums text-text-dim">{n.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-text-dim">
        {total === 0
          ? "Log films with a category and watch your radar fill out."
          : lastUsed.size > 0
            ? "Further out = more films in that lane. The glowing point is your latest film's lane."
            : "Further out = more films in that lane. Tap a chip for its films."}
      </p>

      {/* selected category → its films */}
      {active && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
          <div className="mt-3 rounded-xl border border-hairline bg-chip p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-text-hi">
                <span style={{ color: tint(active.color) }}>
                  <Icon name={active.icon as IconName} size={15} />
                </span>
                {active.label}
              </span>
              <button onClick={() => setSelected(null)} className="text-xs text-text-dim hover:text-text-hi">
                Close
              </button>
            </div>
            {active.items.length === 0 ? (
              <p className="text-xs text-text-dim">Nothing here yet — {active.blurb.toLowerCase()}.</p>
            ) : (
              <ul className="space-y-1.5">
                {active.items.slice(0, 6).map((f, i) => (
                  <li key={f.id ?? i} className="flex items-center justify-between text-xs">
                    <span className="truncate text-text-hi">{f.title}</span>
                    <span className="shrink-0 tabular-nums text-text-dim">
                      {f.likes != null ? `${f.likes}♡` : (f.date ?? "")}
                    </span>
                  </li>
                ))}
                {active.items.length > 6 && (
                  <li className="text-[11px] text-text-dim">+{active.items.length - 6} more</li>
                )}
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}
