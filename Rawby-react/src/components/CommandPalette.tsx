// ⌘K / Ctrl+K command palette — jump anywhere, switch themes, flip settings.
// Self-contained: mounts once in the Shell, owns its own hotkey.
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconName } from "./ui/Icon";
import { useTheme, ACCENTS } from "../store/theme";
import { useSettings } from "../store/settings";
import { useAuth } from "../store/auth";

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: IconName;
  keywords?: string;
  run: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const nav = useNavigate();

  const mode = useTheme((s) => s.mode);
  const toggleMode = useTheme((s) => s.toggleMode);
  const setAccent = useTheme((s) => s.setAccent);
  const bgMode = useSettings((s) => s.bgMode);
  const setBgMode = useSettings((s) => s.setBgMode);
  const logout = useAuth((s) => s.logout);
  const isAdmin = useAuth((s) => s.user?.isAdmin);

  const commands = useMemo<Command[]>(() => {
    const go = (to: string) => () => nav(to);
    const pages: Command[] = [
      { id: "home", label: "Go to Home", icon: "home", keywords: "dashboard start", run: go("/home") },
      { id: "prompts", label: "Go to Prompts", icon: "clapper", keywords: "weekly generate", run: go("/prompts") },
      { id: "ranks", label: "Go to Leaderboard", icon: "trophy", keywords: "ranks scores", run: go("/leaderboard") },
      { id: "atlas", label: "Go to Atlas", icon: "globe", keywords: "map world pins", run: go("/atlas") },
      { id: "gear", label: "Go to Gear", icon: "aperture", keywords: "camera kit", run: go("/gear") },
      { id: "ideas", label: "Go to Idea bank", icon: "bulb", keywords: "inspiration sparks", run: go("/idea-bank") },
      { id: "aurora", label: "Chat with Aurora", icon: "sparkles", keywords: "assistant ai help", run: go("/assistant") },
      { id: "profile", label: "Go to Profile", icon: "user", keywords: "films history privacy", run: go("/profile") },
      { id: "settings", label: "Go to Settings", icon: "settings", keywords: "preferences theme", run: go("/settings") },
      ...(isAdmin
        ? [{ id: "admin", label: "Go to Admin", icon: "shield" as IconName, keywords: "manage", run: go("/admin") }]
        : []),
    ];
    const actions: Command[] = [
      {
        id: "mode",
        label: mode === "dark" ? "Switch to light theme" : "Switch to dark theme",
        icon: mode === "dark" ? "sun" : "moon",
        keywords: "appearance dark light toggle",
        run: toggleMode,
      },
      ...ACCENTS.map((a) => ({
        id: `accent-${a.id}`,
        label: `Accent: ${a.label}`,
        icon: "palette" as IconName,
        keywords: `colour color theme ${a.id}`,
        run: () => setAccent(a.id),
      })),
      ...(["shader", "video", "solid"] as const)
        .filter((m) => m !== bgMode)
        .map((m) => ({
          id: `bg-${m}`,
          label:
            m === "shader"
              ? "Backdrop: animated scene"
              : m === "video"
                ? "Backdrop: real footage"
                : "Backdrop: single colour (minimal)",
          icon: "film" as IconName,
          keywords: "background video shader solid flat minimal cinematic",
          run: () => setBgMode(m),
        })),
      {
        id: "logout",
        label: "Sign out",
        icon: "logout",
        keywords: "log out exit",
        run: () => {
          logout();
          nav("/login", { replace: true });
        },
      },
    ];
    return [...pages, ...actions];
  }, [nav, mode, toggleMode, setAccent, bgMode, setBgMode, logout, isAdmin]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.keywords ?? ""}`.toLowerCase().includes(q));
  }, [commands, query]);

  // Global hotkey.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset + focus when opened.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  function pick(cmd?: Command) {
    if (!cmd) return;
    setOpen(false);
    cmd.run();
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-modal flex items-start justify-center p-4 pt-[14vh]">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative z-10 w-full max-w-lg overflow-hidden !p-0"
          >
            <div className="flex items-center gap-2.5 border-b border-hairline px-4">
              <Icon name="sparkles" size={16} className="shrink-0 text-cinema-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(results.length - 1, a + 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(0, a - 1));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    pick(results[active]);
                  }
                }}
                placeholder="Where to? Try “atlas”, “light”, “ember”…"
                aria-label="Search commands"
                className="w-full bg-transparent py-3.5 text-sm text-text-hi outline-none placeholder:text-text-dim/60"
              />
              <kbd className="shrink-0 rounded border border-hairline bg-chip px-1.5 py-0.5 text-[10px] font-semibold text-text-dim">
                esc
              </kbd>
            </div>
            <ul className="max-h-[46vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-text-dim">Nothing matches.</li>
              )}
              {results.map((c, i) => (
                <li key={c.id}>
                  <button
                    onClick={() => pick(c)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      i === active ? "bg-cinema-500/15 text-text-hi" : "text-text-dim"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        i === active ? "bg-cinema-500/20 text-cinema-400" : "bg-chip"
                      }`}
                    >
                      <Icon name={c.icon} size={14} />
                    </span>
                    <span className="flex-1 truncate">{c.label}</span>
                    {i === active && (
                      <kbd className="rounded border border-hairline bg-chip px-1.5 py-0.5 text-[10px] font-semibold text-text-dim">
                        ↵
                      </kbd>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
