// Left navigation rail (desktop). Collapsed to icons; on hover it widens and
// the page names type themselves out. Opt-in via Settings → Navigation.
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { LogoMark } from "../ui/Logo";
import type { NavItem } from "./nav";

const COLLAPSED = 64;
const EXPANDED = 214;

/** Types a label out character-by-character while `play` is true. Keeps the
 *  full width reserved (invisible tail) so nothing jumps as it types. */
function Typewriter({ text, play }: { text: string; play: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!play) {
      setN(0);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, 26);
    return () => clearInterval(id);
  }, [play, text]);
  return (
    <span aria-hidden>
      {text.slice(0, n)}
      <span className="opacity-0">{text.slice(n)}</span>
    </span>
  );
}

export function SideNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      aria-label="Primary"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      initial={false}
      animate={{ width: open ? EXPANDED : COLLAPSED }}
      transition={{ type: "spring", stiffness: 340, damping: 34 }}
      className="fixed inset-y-0 left-0 z-nav hidden flex-col gap-1 overflow-hidden border-r border-white/[0.06] bg-[rgb(var(--dock))] px-2.5 py-4 backdrop-blur-md md:flex"
    >
      <div className="mb-3 flex h-10 shrink-0 items-center pl-1">
        <LogoMark />
      </div>

      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.to === "/home"}
          title={it.label}
          className={({ isActive }) =>
            `group flex h-11 shrink-0 items-center gap-3 rounded-xl px-[0.7rem] transition-colors ${
              isActive
                ? "bg-cinema-500 text-[#16161a] shadow-[0_6px_18px_-6px_rgb(var(--c-500)/0.45)]"
                : "text-text-dim hover:bg-glass hover:text-text-hi"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon name={it.icon} size={21} strokeWidth={isActive ? 2.3 : 1.9} className="shrink-0" />
              <span className="min-w-0 whitespace-nowrap text-sm font-semibold">
                <Typewriter text={it.label} play={open} />
              </span>
            </>
          )}
        </NavLink>
      ))}
    </motion.nav>
  );
}
