import { AnimatePresence, motion } from "framer-motion";
import { useToasts, type ToastVariant } from "../../store/toast";
import { Icon, type IconName } from "./Icon";
import { EASE_OUT, EASE_IN } from "../../lib/motion";

const STYLES: Record<ToastVariant, { icon: IconName; cls: string }> = {
  success: { icon: "check", cls: "text-success" },
  error: { icon: "alert", cls: "text-danger" },
  info: { icon: "sparkles", cls: "text-cinema-400" },
};

export function ToastViewport() {
  const toasts = useToasts((s) => s.toasts);
  const dismiss = useToasts((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-toast flex w-[min(92vw,360px)] flex-col gap-2"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const s = STYLES[t.variant];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { ease: EASE_OUT, duration: 0.28 } }}
              exit={{ opacity: 0, x: 24, transition: { ease: EASE_IN, duration: 0.2 } }}
              className="glass pointer-events-auto flex items-start gap-3 p-3.5"
            >
              <span className={`mt-0.5 shrink-0 ${s.cls}`}>
                <Icon name={s.icon} size={18} />
              </span>
              <p className="flex-1 text-sm text-text-hi">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="shrink-0 text-text-dim transition-colors hover:text-text-hi"
              >
                <Icon name="plus" size={16} className="rotate-45" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
