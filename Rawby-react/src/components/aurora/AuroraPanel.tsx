// Aurora's chat panel — a pinned glass window that pops from her chat head.
// Desktop: fixed bottom-right card. Phone: near-full sheet. RAWBY-style
// header (name + status), no OS window chrome.
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../ui/Icon";
import { AuroraChat } from "./AuroraChat";

export function AuroraPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="aurora-panel"
          role="dialog"
          aria-label="Aurora chat"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          style={{ transformOrigin: "bottom right" }}
          className="glass fixed bottom-[7.5rem] right-3 z-modal flex h-[64vh] max-h-[600px] w-[calc(100vw-1.5rem)] flex-col overflow-hidden !p-0 md:bottom-28 md:right-6 md:w-[400px]"
        >
          {/* Header — hers, not an OS titlebar */}
          <div className="flex shrink-0 items-center gap-2.5 border-b border-hairline px-4 py-3">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-cinema-500/15">
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
              <Icon name="arrowRight" size={15} className="-rotate-45" />
            </Link>
            <button
              onClick={onClose}
              aria-label="Close Aurora"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-glass hover:text-text-hi"
            >
              <Icon name="plus" size={17} className="rotate-45" />
            </button>
          </div>

          <AuroraChat compact />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
