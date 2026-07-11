// Aurora's full studio page — the deep-work surface (trip planning, video
// check, quick note). Day-to-day chat lives in the floating panel; this
// page hosts the same thread with the extra tools around it.
import { useState } from "react";
import { PageTransition } from "../components/layout/PageTransition";
import { GlassCard } from "../components/ui/GlassCard";
import { GradientButton } from "../components/ui/GradientButton";
import { Eyebrow } from "../components/ui/Bits";
import { Icon } from "../components/ui/Icon";
import { PlanTripModal } from "../components/PlanTripModal";
import { PrePostCheckModal } from "../components/PrePostCheckModal";
import { AuroraChat } from "../components/aurora/AuroraChat";
import { AuroraOrb } from "../components/aurora/AuroraOrb";
import { useNote } from "../hooks/usePersonal";

export default function Assistant() {
  const { note, save: saveNote } = useNote();
  const [noteDraft, setNoteDraft] = useState(note);
  const [planOpen, setPlanOpen] = useState(false);
  const [checkOpen, setCheckOpen] = useState(false);

  return (
    <PageTransition>
      {/* Hero — her living form, always awake, faster/warmer while she thinks */}
      <div className="relative mb-6 h-48 overflow-hidden rounded-glass border border-hairline md:h-56">
        <AuroraOrb className="absolute inset-0" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 70% at 50% 40%, transparent 40%, rgb(var(--bg) / 0.9) 100%), " +
              "linear-gradient(to top, rgb(var(--bg)) 0%, transparent 55%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <Eyebrow icon="sparkles">AI Co-pilot</Eyebrow>
          <h1 className="h-display mt-2 text-2xl font-semibold text-text-hi md:text-3xl">Aurora</h1>
          <p className="mt-0.5 text-sm text-text-dim">
            Cinematic guidance for this week's film. Plain talk, no fluff.
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <GradientButton variant="ghost" onClick={() => setPlanOpen(true)}>
          <Icon name="sun" size={15} /> Plan a trip
        </GradientButton>
        <GradientButton variant="ghost" onClick={() => setCheckOpen(true)}>
          <Icon name="film" size={15} /> Check my video
        </GradientButton>
        <span className="text-xs text-text-dim">
          Talk through a trip, then save it — Aurora drops the prompt in on the day.
        </span>
      </div>

      <GlassCard className="mb-4 p-4">
        <label htmlFor="quick-note" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-dim">
          <Icon name="bulb" size={13} /> Quick note — Aurora sees this
        </label>
        <input
          id="quick-note"
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={() => noteDraft !== note && saveNote.mutate(noteDraft)}
          placeholder="e.g. shooting a rainy market this week, no tripod"
          className="w-full rounded-xl border border-hairline bg-field px-4 py-2.5 text-sm text-text-hi outline-none placeholder:text-text-dim/60 focus:border-cinema-500/70"
        />
      </GlassCard>

      <GlassCard className="flex h-[62vh] flex-col !p-0">
        <AuroraChat />
      </GlassCard>

      <PlanTripModal open={planOpen} onClose={() => setPlanOpen(false)} />
      <PrePostCheckModal open={checkOpen} onClose={() => setCheckOpen(false)} />
    </PageTransition>
  );
}
