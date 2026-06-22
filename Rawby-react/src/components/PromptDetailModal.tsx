// Detailed prompt workspace — storyline, shots, music, notes, and gear,
// persisted as the active draft. Optional Aurora help via the chat (which
// already has the user's profile + note context).
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Modal } from "./ui/Modal";
import { GradientButton } from "./ui/GradientButton";
import { Icon } from "./ui/Icon";
import { FilmTag } from "./ui/FilmTag";
import { useDraft } from "../hooks/usePersonal";
import { useGear } from "../hooks/useGear";

const areaCls =
  "w-full rounded-xl border border-hairline bg-field px-4 py-3 text-sm leading-relaxed text-text-hi outline-none placeholder:text-text-dim/60 focus:border-cinema-500/70";

function Area({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-dim">
        {label}
      </label>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={areaCls}
      />
    </div>
  );
}

export function PromptDetailModal({
  open,
  onClose,
  onFilm,
}: {
  open: boolean;
  onClose: () => void;
  onFilm: (level: string) => void;
}) {
  const { draft, update } = useDraft();
  const { gear } = useGear();
  const [storyline, setStoryline] = useState("");
  const [shots, setShots] = useState("");
  const [music, setMusic] = useState("");
  const [notes, setNotes] = useState("");
  const [usedGear, setUsedGear] = useState<string[]>([]);

  useEffect(() => {
    if (open && draft) {
      setStoryline(draft.storyline ?? "");
      setShots((draft.shots ?? []).join("\n"));
      setMusic((draft.music ?? []).join("\n"));
      setNotes(draft.notes ?? "");
      setUsedGear(draft.gear ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function persist(extraGear?: string[]) {
    if (!draft) return;
    const lines = (t: string) => t.split("\n").map((s) => s.trim()).filter(Boolean);
    update.mutate({
      storyline,
      notes,
      shots: lines(shots),
      music: lines(music),
      gear: extraGear ?? usedGear,
    });
  }

  return (
    <Modal open={open} onClose={() => { persist(); onClose(); }} title="Work it out">
      {!draft ? (
        <p className="py-6 text-center text-sm text-text-dim">No prompt open.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <FilmTag level={draft.level} />
            <p className="mt-2 text-sm leading-relaxed text-text-hi">{draft.promptText}</p>
          </div>

          <Area label="Storyline" value={storyline} onChange={setStoryline} onBlur={() => persist()} placeholder="Beats, arc, the feeling you're after…" rows={3} />
          <Area label="Shots (one per line)" value={shots} onChange={setShots} onBlur={() => persist()} placeholder="Opening — wide, slow push…" rows={4} />
          <Area label="Music (one per line)" value={music} onChange={setMusic} onBlur={() => persist()} placeholder="Track ideas…" rows={2} />
          <Area label="Notes" value={notes} onChange={setNotes} onBlur={() => persist()} placeholder="Locations, schedule, reminders…" rows={2} />

          {gear.length > 0 && (
            <div>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-dim">Gear for this</div>
              <div className="flex flex-wrap gap-2">
                {gear.map((g) => {
                  const on = usedGear.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        const next = on ? usedGear.filter((x) => x !== g.id) : [...usedGear, g.id];
                        setUsedGear(next);
                        persist(next);
                      }}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        on
                          ? "border-cinema-500 bg-cinema-500/15 text-cinema-300"
                          : "border-hairline bg-chip text-text-dim hover:text-text-hi"
                      }`}
                    >
                      {[g.brand, g.type].filter(Boolean).join(" ")}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <GradientButton onClick={() => { persist(); onFilm(draft.level); }}>
              <Icon name="film" size={15} /> Film this
            </GradientButton>
            <Link to="/assistant" onClick={() => persist()}>
              <GradientButton variant="ghost">
                <Icon name="sparkles" size={15} /> Aurora help
              </GradientButton>
            </Link>
          </div>
        </div>
      )}
    </Modal>
  );
}
