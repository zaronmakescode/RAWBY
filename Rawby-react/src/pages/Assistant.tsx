// Aurora's full studio page — the deep-work surface (trip planning, video
// check, quick note). Day-to-day chat lives in the floating panel; this
// page hosts the same thread with the extra tools around it.
import { useState } from "react";
import { PageTransition } from "../components/layout/PageTransition";
import { GlassCard } from "../components/ui/GlassCard";
import { GradientButton } from "../components/ui/GradientButton";
import { PageHeader } from "../components/ui/Bits";
import { Icon } from "../components/ui/Icon";
import { PlanTripModal } from "../components/PlanTripModal";
import { PrePostCheckModal } from "../components/PrePostCheckModal";
import { AuroraChat } from "../components/aurora/AuroraChat";
import { useNote } from "../hooks/usePersonal";

export default function Assistant() {
  const { note, save: saveNote } = useNote();
  const [noteDraft, setNoteDraft] = useState(note);
  const [planOpen, setPlanOpen] = useState(false);
  const [checkOpen, setCheckOpen] = useState(false);

  return (
    <PageTransition>
      <PageHeader
        eyebrow="AI Co-pilot"
        title="Aurora"
        sub="Cinematic guidance for this week's film. Plain talk, no fluff."
      />

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
