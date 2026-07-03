// The videography web — a living radial constellation. Each category is a
// node tethered to your core: the more films you've made in it, the BIGGER
// the node and the FURTHER it pushes out from the centre. The categories of
// your latest film glow. Click a node to see its films.
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Icon, type IconName } from "./ui/Icon";
import { GlassCard } from "./ui/GlassCard";
import { VIDEO_CATEGORIES } from "../lib/constants";
import type { ProjectHistoryItem } from "../types";

function statFor(history: ProjectHistoryItem[], id: string) {
  const items = history.filter((h) => h.categories?.includes(id));
  const liked = items.filter((h) => h.likes != null && h.likes > 0);
  const avg = liked.length
    ? Math.round(liked.reduce((s, h) => s + (h.likes ?? 0), 0) / liked.length)
    : null;
  return { count: items.length, avg, items };
}

const W = 440;
const H = 380;
const CX = W / 2;
const CY = H / 2;
const R_MIN = 74; // resting orbit for untouched categories
const R_MAX = 150; // strongest category pushes out this far
const NODE_MIN = 17;
const NODE_MAX = 29;

export function CategoryBox({ history }: { history: ProjectHistoryItem[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const { nodes, lastUsed, total } = useMemo(() => {
    const stats = VIDEO_CATEGORIES.map((c) => ({ ...c, ...statFor(history, c.id) }));
    const max = Math.max(1, ...stats.map((s) => s.count));
    // Categories of the most recent film that has any — they get the glow.
    const latest = history.find((h) => h.categories?.length);
    const last = new Set(latest?.categories ?? []);
    const nodes = stats.map((s, i) => {
      const share = s.count / max;
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / stats.length;
      const r = R_MIN + share * (R_MAX - R_MIN);
      return {
        ...s,
        share,
        x: CX + Math.cos(angle) * r,
        y: CY + Math.sin(angle) * r,
        size: NODE_MIN + share * (NODE_MAX - NODE_MIN),
        isLast: last.has(s.id),
      };
    });
    return { nodes, lastUsed: last, total: history.length };
  }, [history]);

  const active = selected ? nodes.find((n) => n.id === selected) : null;

  return (
    <GlassCard className="p-3 md:p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Your videography web">
        {/* faint resting orbit */}
        <circle cx={CX} cy={CY} r={R_MIN} fill="none" stroke="rgb(var(--hairline))" strokeDasharray="2 5" />

        {/* threads: core → node */}
        {nodes.map((n) => (
          <line
            key={`l-${n.id}`}
            x1={CX}
            y1={CY}
            x2={n.x}
            y2={n.y}
            stroke={n.color}
            strokeOpacity={n.count ? 0.24 + n.share * 0.3 : 0.1}
            strokeWidth={1 + n.share * 1.6}
          />
        ))}

        {/* core */}
        <circle cx={CX} cy={CY} r="26" fill="rgb(var(--surface))" stroke="rgb(var(--hairline-strong))" />
        <circle cx={CX} cy={CY} r="4" fill="rgb(var(--c-500))" />
        <text
          x={CX}
          y={CY + 15}
          textAnchor="middle"
          className="fill-[rgb(var(--text-dim))]"
          style={{ font: "600 8px Inter, sans-serif", letterSpacing: "0.1em" }}
        >
          {total ? `${total} FILM${total === 1 ? "" : "S"}` : "NO FILMS YET"}
        </text>

        {/* category nodes */}
        {nodes.map((n, i) => {
          const dim = n.count === 0;
          const isSel = selected === n.id;
          const isHov = hovered === n.id;
          return (
            <motion.g
              key={n.id}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.07, type: "spring", stiffness: 220, damping: 16 }}
              style={{ transformOrigin: `${n.x}px ${n.y}px`, cursor: "pointer" }}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected((s) => (s === n.id ? null : n.id))}
            >
              {/* breathe — slow float, staggered per node */}
              <motion.g
                animate={{ y: [0, -3.5, 0] }}
                transition={{ duration: 4 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
              >
                {/* last-used glow ring */}
                {n.isLast && (
                  <>
                    <circle cx={n.x} cy={n.y} r={n.size + 7} fill={n.color} opacity="0.12" />
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.size + 4}
                      fill="none"
                      stroke={n.color}
                      strokeWidth="1.5"
                      opacity="0.85"
                    />
                  </>
                )}
                {/* body */}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.size * (isHov || isSel ? 1.08 : 1)}
                  fill={dim ? "rgb(var(--chip))" : `${n.color}2e`}
                  stroke={isSel ? n.color : dim ? "rgb(var(--hairline-strong))" : `${n.color}66`}
                  strokeWidth={isSel ? 2 : 1}
                  style={{ transition: "r 150ms ease" }}
                />
                {/* icon */}
                <foreignObject
                  x={n.x - 9}
                  y={n.y - 9 - (n.count ? 4 : 0)}
                  width="18"
                  height="18"
                  style={{ pointerEvents: "none", color: dim ? "rgb(var(--text-dim))" : n.color }}
                >
                  <Icon name={n.icon as IconName} size={18} />
                </foreignObject>
                {/* count inside the node */}
                {n.count > 0 && (
                  <text
                    x={n.x}
                    y={n.y + 15}
                    textAnchor="middle"
                    fill={n.color}
                    style={{ font: "700 10px Inter, sans-serif", pointerEvents: "none" }}
                  >
                    {n.count}
                  </text>
                )}
                {/* label under the node */}
                <text
                  x={n.x}
                  y={n.y + n.size + 15}
                  textAnchor="middle"
                  className={dim ? "fill-[rgb(var(--text-dim))]" : "fill-[rgb(var(--text-hi))]"}
                  style={{ font: "600 10.5px Inter, sans-serif", pointerEvents: "none" }}
                >
                  {n.label}
                </text>
                {/* hover stat */}
                {isHov && n.avg != null && (
                  <text
                    x={n.x}
                    y={n.y + n.size + 28}
                    textAnchor="middle"
                    className="fill-[rgb(var(--text-dim))]"
                    style={{ font: "500 9.5px Inter, sans-serif", pointerEvents: "none" }}
                  >
                    ~{n.avg}♡ per film
                  </text>
                )}
              </motion.g>
            </motion.g>
          );
        })}
      </svg>

      {/* legend line */}
      <p className="mt-1 text-center text-[11px] text-text-dim">
        {total === 0
          ? "Log films with a category and watch your web grow outward."
          : lastUsed.size > 0
            ? "Bigger + further out = more films there. Glowing = your latest film's lane."
            : "Bigger + further out = more films there. Tap a node for its films."}
      </p>

      {/* selected node → its films */}
      {active && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden"
        >
          <div className="mt-3 rounded-xl border border-hairline bg-chip p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-text-hi">
                <span style={{ color: active.color }}>
                  <Icon name={active.icon as IconName} size={15} />
                </span>
                {active.label}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-text-dim hover:text-text-hi"
              >
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
