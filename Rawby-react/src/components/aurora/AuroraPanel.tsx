// Aurora's chat window — a big, near-fullscreen mac-style window that opens
// from her chat head. Traffic-light titlebar (red closes), dimmed backdrop,
// esc to close. Phone: fills the screen. The chat column is width-capped so
// the conversation stays readable inside the wide window.
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../ui/Icon";
import { AuroraChat } from "./AuroraChat";

export function AuroraPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-0 sm:p-4 md:p-6">
          {/* backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* window */}
          <motion.div
            role="dialog"
            aria-label="Aurora"
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="glass relative z-10 flex h-full w-full flex-col overflow-hidden !rounded-none !p-0 sm:h-[86vh] sm:max-h-[860px] sm:w-full sm:max-w-5xl sm:!rounded-[18px]"
          >
            {/* mac titlebar */}
            <div className="relative flex shrink-0 items-center gap-2 border-b border-hairline px-4 py-3">
              {/* traffic lights — red closes */}
              <div className="group flex items-center gap-2">
                <button
                  onClick={onClose}
                  aria-label="Close Aurora"
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff5f57] transition-transform hover:scale-110"
                >
                  <Icon name="plus" size={9} className="rotate-45 text-black/50 opacity-0 group-hover:opacity-100" />
                </button>
                <span className="h-3.5 w-3.5 rounded-full bg-[#febc2e]" />
                <span className="h-3.5 w-3.5 rounded-full bg-[#28c840]" />
              </div>

              {/* centered title */}
              <div className="pointer-events-none absolute inset-x-0 flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-[3px]">
                    <span className="h-[8px] w-[5px] rounded-full bg-cinema-400" />
                    <span className="h-[8px] w-[5px] rounded-full bg-cinema-400" />
                  </span>
                  <span className="h-display text-sm font-bold text-text-hi">Aurora</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-text-dim">
                  cinematic co-pilot
                </span>
              </div>

              {/* full-studio shortcut */}
              <Link
                to="/assistant"
                onClick={onClose}
                title="Open the full studio — trips + video check"
                aria-label="Open full Aurora page"
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-glass hover:text-text-hi"
              >
                <Icon name="arrowRight" size={16} className="-rotate-45" />
              </Link>
            </div>

            {/* chat — capped width so it stays readable in the wide window */}
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden">
              <AuroraChat />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
