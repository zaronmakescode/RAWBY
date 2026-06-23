import { useEffect, useState } from "react";
import { Modal } from "./ui/Modal";
import { GradientButton } from "./ui/GradientButton";
import { Icon } from "./ui/Icon";
import { FilmTag } from "./ui/FilmTag";
import { useTrips } from "../hooks/useTrips";
import { useGeneratePrompts } from "../hooks/usePrompts";
import type { GeneratedPrompt } from "../types";

const fieldCls =
  "w-full rounded-xl border border-hairline bg-field px-4 py-3 text-sm text-text-hi outline-none placeholder:text-text-dim/60 focus:border-cinema-500/70";

function inDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Plan a trip ahead with Aurora: pick a date + filming window, describe the
 * idea, and work out a prompt together. On the start date the trip
 * auto-activates with that prompt and a custom filming deadline.
 */
export function PlanTripModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { add } = useTrips();
  const gen = useGeneratePrompts();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(inDays(7));
  const [days, setDays] = useState(3);
  const [idea, setIdea] = useState("");
  const [notes, setNotes] = useState("");
  const [options, setOptions] = useState<GeneratedPrompt[]>([]);
  const [picked, setPicked] = useState<GeneratedPrompt | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setStartDate(inDays(7));
      setDays(3);
      setIdea("");
      setNotes("");
      setOptions([]);
      setPicked(null);
      add.reset();
      gen.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function workOutPrompt() {
    const seed = `Trip: ${title || "(untitled)"} starting ${startDate} over ${days} day${
      days === 1 ? "" : "s"
    }. ${idea}`.trim();
    gen.mutate(seed, {
      onSuccess: (ps) => {
        setOptions(ps);
        setPicked(ps[0] ?? null);
      },
    });
  }

  function save() {
    if (!title.trim()) return;
    add.mutate(
      {
        title: title.trim(),
        startDate,
        days,
        notes: notes.trim() || undefined,
        promptText: picked?.text,
        promptLevel: picked?.level,
      },
      { onSuccess: onClose }
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Plan a trip with Aurora">
      <div className="space-y-4">
        <p className="text-sm text-text-dim">
          Tell Aurora about a trip ahead of time. She'll line it up on your calendar and, when
          the day comes, drop in the prompt you worked out with a filming window to match.
        </p>

        <div>
          <label htmlFor="trip-title" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-dim">
            Trip name
          </label>
          <input
            id="trip-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Dolomites road trip"
            className={fieldCls}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="trip-start" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-dim">
              Starts
            </label>
            <input
              id="trip-start"
              type="date"
              value={startDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setStartDate(e.target.value)}
              className={fieldCls}
            />
          </div>
          <div>
            <label htmlFor="trip-days" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-dim">
              Filming days
            </label>
            <input
              id="trip-days"
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
              className={fieldCls}
            />
          </div>
        </div>

        <div>
          <label htmlFor="trip-idea" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-dim">
            The idea — what's the trip about?
          </label>
          <textarea
            id="trip-idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g. solo hike, drone over the peaks, a quiet story about being on the road alone"
            rows={2}
            className={`${fieldCls} resize-none`}
          />
          <button
            type="button"
            onClick={workOutPrompt}
            disabled={gen.isPending}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-cinema-500/15 px-3 py-1.5 text-xs font-semibold text-cinema-300 transition-colors hover:bg-cinema-500/25 disabled:opacity-50"
          >
            <Icon name="sparkles" size={13} />
            {gen.isPending ? "Working it out…" : options.length ? "Regenerate" : "Work out a prompt with Aurora"}
          </button>
        </div>

        {options.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-text-dim">Pick the one</div>
            {options.map((p, i) => {
              const on = picked === p;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPicked(p)}
                  className={`block w-full rounded-xl border p-3 text-left transition-colors ${
                    on ? "border-cinema-500/70 bg-cinema-500/[0.08]" : "border-hairline bg-chip hover:border-hairline-strong"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <FilmTag level={p.level} />
                    {on && <Icon name="check" size={14} className="text-cinema-400" />}
                  </div>
                  <p className="text-sm leading-snug text-text-hi">{p.text}</p>
                </button>
              );
            })}
          </div>
        )}

        <div>
          <label htmlFor="trip-notes" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-dim">
            Notes for the day (optional)
          </label>
          <input
            id="trip-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. pack ND filters, golden hour is ~8pm"
            className={fieldCls}
          />
        </div>

        <GradientButton onClick={save} loading={add.isPending} disabled={!title.trim()} className="w-full">
          <Icon name="check" size={16} /> Save trip
        </GradientButton>
      </div>
    </Modal>
  );
}
