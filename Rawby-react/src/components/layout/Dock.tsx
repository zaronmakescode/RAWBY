// RAWBY bottom bar — a flat glass strip (own identity, not a macOS dock).
// Active destination gets an accent tint + a small marker dot; tiles lift
// slightly on hover.
import { NavLink } from "react-router-dom";
import { Icon } from "../ui/Icon";
import type { NavItem } from "./nav";

export function Dock({ items }: { items: NavItem[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-nav flex justify-center px-3 pb-3 md:pb-5">
      <nav
        aria-label="Primary"
        className="dock no-scrollbar pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-hairline bg-[rgb(var(--dock))] px-2 py-1.5"
      >
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === "/home"}
            title={it.label}
            className={({ isActive }) =>
              `group relative flex h-11 w-12 shrink-0 flex-col items-center justify-center rounded-xl transition-[color,background-color,transform] duration-200 ease-out active:scale-90 ${
                isActive
                  ? "bg-cinema-500/14 text-cinema-400"
                  : "text-text-dim hover:-translate-y-0.5 hover:bg-glass hover:text-text-hi"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={it.icon} size={21} strokeWidth={isActive ? 2.2 : 1.8} />
                {/* marker dot under the active icon */}
                <span
                  className={`absolute bottom-1 h-1 w-1 rounded-full bg-cinema-500 transition-opacity duration-200 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-hairline bg-[rgb(var(--surface))] px-2.5 py-1 text-[11px] font-semibold text-text-hi opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                  {it.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
