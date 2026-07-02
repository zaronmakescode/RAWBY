// The videography breakdown — one clean glass card ranking the five lanes
// by how much you've filmed in each. A film can belong to several lanes,
// so counts overlap on purpose.
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
  return { count: items.length, avg };
}

export function CategoryBox({ history }: { history: ProjectHistoryItem[] }) {
  const rows = VIDEO_CATEGORIES.map((c) => ({ ...c, ...statFor(history, c.id) })).sort(
    (a, b) => b.count - a.count
  );
  const max = Math.max(1, ...rows.map((r) => r.count));
  const total = history.length;

  return (
    <GlassCard className="p-5 md:p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-xs text-text-dim">
          {total === 0
            ? "Log films with a category to fill this in."
            : "Where your films live — a film can span several lanes."}
        </p>
        {total > 0 && (
          <span className="rounded-full border border-hairline bg-chip px-2.5 py-1 text-[11px] font-semibold tabular-nums text-text-dim">
            {total} {total === 1 ? "film" : "films"}
          </span>
        )}
      </div>

      <ul className="space-y-1.5">
        {rows.map((c, i) => {
          const empty = c.count === 0;
          return (
            <li
              key={c.id}
              className={`group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-glass ${
                empty ? "opacity-55" : ""
              }`}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  color: c.color,
                  background: `${c.color}1a`,
                  boxShadow: `inset 0 0 0 1px ${c.color}33`,
                }}
              >
                <Icon name={c.icon as IconName} size={16} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-semibold text-text-hi">{c.label}</span>
                  <span className="shrink-0 text-xs tabular-nums text-text-dim">
                    <span className="text-sm font-bold text-text-hi">{c.count}</span>
                    <span className="hidden sm:inline"> {c.count === 1 ? "film" : "films"}</span>
                    {c.avg != null && ` · ${c.avg}♡`}
                  </span>
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-chip">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: c.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(c.count / max) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <div className="mt-1 hidden text-[11px] leading-snug text-text-dim group-hover:block">
                  {c.blurb}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
