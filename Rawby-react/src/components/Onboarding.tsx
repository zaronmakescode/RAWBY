// First-run questionnaire — Aurora asks a few things to personalise every
// generated prompt. Shows once (until the profile is completed or skipped).
import { useState } from "react";
import { Modal } from "./ui/Modal";
import { GradientButton } from "./ui/GradientButton";
import { Icon } from "./ui/Icon";
import { useMe } from "../hooks/queries";
import { useProfile } from "../hooks/usePersonal";

const fieldCls =
  "w-full rounded-xl border border-hairline bg-field px-4 py-3 text-sm text-text-hi outline-none placeholder:text-text-dim/60 focus:border-cinema-500/70";

const EXPERIENCE = ["Beginner", "Intermediate", "Advanced", "Pro"];

export function Onboarding() {
  const { data } = useMe();
  const { profile, save } = useProfile();
  const [dismissed, setDismissed] = useState(false);
  const [f, setF] = useState({ location: "", style: "", experience: "Intermediate", focus: "" });

  const show = !!data && !profile?.completed && !dismissed;
  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  return (
    <Modal open={show} onClose={() => setDismissed(true)} title="Let's make this yours">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(f, { onSuccess: () => setDismissed(true) });
        }}
        className="space-y-4"
      >
        <p className="flex items-start gap-2 text-sm text-text-dim">
          <Icon name="sparkles" size={16} className="mt-0.5 shrink-0 text-cinema-400" />
          Aurora here. Tell me a bit about you and your kit — every prompt I generate gets
          tailored to it.
        </p>

        <div>
          <label htmlFor="ob-loc" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-dim">
            Where exactly do you shoot?
          </label>
          <input id="ob-loc" value={f.location} onChange={upd("location")} placeholder="e.g. Budapest, Hungary — city + riverside" className={fieldCls} />
        </div>

        <div>
          <label htmlFor="ob-style" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-dim">
            Your style / vibe
          </label>
          <input id="ob-style" value={f.style} onChange={upd("style")} placeholder="e.g. moody, handheld, warm grade" className={fieldCls} />
        </div>

        <div>
          <label htmlFor="ob-exp" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-dim">
            Experience
          </label>
          <select id="ob-exp" value={f.experience} onChange={upd("experience")} className={fieldCls}>
            {EXPERIENCE.map((x) => (
              <option key={x} value={x} className="bg-ink-card">{x}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ob-focus" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-dim">
            What do you want from filmmaking?
          </label>
          <input id="ob-focus" value={f.focus} onChange={upd("focus")} placeholder="e.g. tell small human stories; grow a reel audience" className={fieldCls} />
        </div>

        <div className="flex items-center justify-between pt-1">
          <button type="button" onClick={() => setDismissed(true)} className="text-sm text-text-dim hover:text-text-hi">
            Skip for now
          </button>
          <GradientButton type="submit" loading={save.isPending}>
            Save & personalise
          </GradientButton>
        </div>
        <p className="text-center text-[11px] text-text-dim">Add your gear later in the Gear tab — it's used too.</p>
      </form>
    </Modal>
  );
}
