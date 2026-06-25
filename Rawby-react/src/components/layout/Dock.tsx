// Apple-"Tahoe"-style floating liquid-glass dock. Sits centred at the bottom;
// frosted, rounded, with icon tiles that lift + label on hover and an accent
// tile + running dot for the active route.
import { NavLink } from "react-router-dom";
import { Icon } from "../ui/Icon";
import type { NavItem } from "./nav";

export function Dock({ items }: { items: NavItem[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-nav flex justify-center px-3 pb-4 md:pb-6">
      <nav
        aria-label="Primary"
        className="dock no-scrollbar pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-[28px] border border-white/12 bg-[rgb(var(--surface)/0.5)] px-2.5 py-2 backdrop-blur-2xl"
      >
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === "/home"}
            title={it.label}
            className={({ isActive }) =>
              `group relative flex h-[3.1rem] w-[3.1rem] shrink-0 items-center justify-center rounded-[18px] transition-all duration-200 ease-out ${
                isActive
                  ? "bg-cinema-500 text-[#16161a] shadow-[0_6px_18px_-6px_rgb(var(--c-500)/0.7)]"
                  : "text-text-dim hover:-translate-y-1.5 hover:bg-glass hover:text-text-hi"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={it.icon} size={23} strokeWidth={isActive ? 2.3 : 1.9} />
                {/* hover label */}
                <span className="pointer-events-none absolute -top-10 whitespace-nowrap rounded-lg border border-hairline bg-[rgb(var(--surface))] px-2.5 py-1 text-[11px] font-semibold text-text-hi opacity-0 shadow-lg transition-all duration-150 group-hover:-top-9 group-hover:opacity-100">
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
