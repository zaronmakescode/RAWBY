import { useEffect, useState } from "react";
import { Modal } from "./ui/Modal";
import { GradientButton } from "./ui/GradientButton";
import { Icon } from "./ui/Icon";
import { useBigProject } from "../hooks/useBigProject";

const fieldCls =
  "w-full rounded-xl border border-hairline bg-field px-4 py-3 text-sm text-text-hi outline-none placeholder:text-text-dim/60 focus:border-cinema-500/70";

// Default deadline = 4 weeks out.
function defaultDeadline() {
  const d = new Date();
  d.setDate(d.getDate() + 28);
  return d.toISOString().slice(0, 10);
}

export function StartBigProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { start } = useBigProject();
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState(defaultDeadline());

  useEffect(() => {
    if (open) {
      setTitle("");
      setDeadline(defaultDeadline());
      start.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Start a Big Project">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) start.mutate({ title, deadline }, { onSuccess: onClose });
        }}
        className="space-y-4"
      >
        <p className="text-sm text-text-dim">
          150 points. Set your own deadline — film it over weeks, submit when it's ready.
        </p>
        <div>
          <label htmlFor="bp-title" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-dim">
            Project title
          </label>
          <input
            id="bp-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The Winter Documentary"
            className={fieldCls}
            required
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="bp-deadline" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-dim">
            Your deadline
          </label>
          <input
            id="bp-deadline"
            type="date"
            value={deadline}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDeadline(e.target.value)}
            className={fieldCls}
          />
        </div>
        <GradientButton type="submit" variant="story" loading={start.isPending} disabled={!title.trim()} className="w-full">
          <Icon name="film" size={16} /> Start project
        </GradientButton>
      </form>
    </Modal>
  );
}
