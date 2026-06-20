import { useEffect } from "react";
import { motion } from "framer-motion";
import { Modal } from "./ui/Modal";
import { GradientButton } from "./ui/GradientButton";
import { FilmTag } from "./ui/FilmTag";
import { Spinner } from "./ui/Bits";
import { Icon } from "./ui/Icon";
import { stagger, item } from "../lib/motion";
import { useGeneratePrompts, useSetActivePrompt } from "../hooks/usePrompts";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GeneratePromptsModal({ open, onClose }: Props) {
  const gen = useGeneratePrompts();
  const setActive = useSetActivePrompt();

  // Generate a fresh set each time the modal opens.
  useEffect(() => {
    if (open) {
      gen.reset();
      setActive.reset();
      gen.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const prompts = gen.data ?? [];

  return (
    <Modal open={open} onClose={onClose} title="This week's prompts">
      {gen.isPending ? (
        <Spinner label="Writing three prompts…" />
      ) : prompts.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-text-dim">No prompts came back.</p>
          <GradientButton onClick={() => gen.mutate()} className="mt-4">
            <Icon name="refresh" size={16} /> Try again
          </GradientButton>
        </div>
      ) : (
        <>
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            {prompts.map((p, i) => (
              <motion.button
                key={i}
                variants={item}
                onClick={() => setActive.mutate(p, { onSuccess: onClose })}
                disabled={setActive.isPending}
                className="group w-full rounded-xl border border-hairline bg-chip p-4 text-left transition-colors hover:border-cinema-500/50 disabled:opacity-60"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <FilmTag level={p.level} />
                  {p.emotion && (
                    <span className="text-[11px] uppercase tracking-wider text-text-dim">
                      {p.emotion}
                    </span>
                  )}
                </div>
                <p className="line-clamp-3 text-sm leading-relaxed text-text-hi">{p.text}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cinema-400 opacity-0 transition-opacity group-hover:opacity-100">
                  Use this prompt <Icon name="arrowRight" size={13} />
                </span>
              </motion.button>
            ))}
          </motion.div>

          <button
            onClick={() => gen.mutate()}
            disabled={gen.isPending}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-text-dim transition-colors hover:text-text-hi disabled:opacity-50"
          >
            <Icon name="refresh" size={15} /> Regenerate set
          </button>
        </>
      )}
    </Modal>
  );
}
