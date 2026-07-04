// Aurora's chat window — a big glass window that opens from her chat head.
// No OS chrome; a clean RAWBY header with a close X. The window stops above
// the dock so the menu stays visible and reachable underneath it. Phone:
// fills the screen down to the dock. Esc closes.
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
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        // Region stops short of the bottom (bottom-24) so the dock / menu
        // stays visible and clickable underneath the window.
        <div className="fixed inset-x-0 top-0 bottom-24 z-modal flex items-stretch justify-center p-0 sm:items-center sm:p-4 md:p-6">
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-label="Aurora"
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="glass relative z-10 flex h-full w-full flex-col overflow-hidden !rounded-none !p-0 sm:h-full sm:max-h-[820px] sm:w-full sm:max-w-5xl sm:!rounded-[18px]"
          >
            {/* header — Aurora's, not an OS titlebar */}
            <div className="flex shrink-0 items-center gap-2.5 border-b border-hairline px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cinema-500/15">
                <span className="flex items-center gap-[3px]">
                  <span className="h-[9px] w-[6px] rounded-full bg-cinema-400" />
                  <span className="h-[9px] w-[6px] rounded-full bg-cinema-400" />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="h-display text-sm font-bold leading-tight text-text-hi">Aurora</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-text-dim">
                  cinematic co-pilot
                </div>
              </div>
              <Link
                to="/assistant"
                onClick={onClose}
                title="Open the full studio — trips + video check"
                aria-label="Open full Aurora page"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-glass hover:text-text-hi"
              >
                <Icon name="arrowRight" size={16} className="-rotate-45" />
              </Link>
              <button
                onClick={onClose}
                aria-label="Close Aurora"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-glass hover:text-text-hi"
              >
                <Icon name="plus" size={18} className="rotate-45" />
              </button>
            </div>

            {/* chat — width-capped so it stays readable in the wide window */}
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
