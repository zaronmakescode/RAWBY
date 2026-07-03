// ============================================================
// RAWBY — weekly prompt generation + selection.
// Generate (POST /api/generate-prompts) returns 3 prompts; picking
// one writes it into the snapshot (promptText/level) and spends a
// regen, pushed via /api/sync. Local-first, like the Flutter app.
// ============================================================
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ai, session } from "../lib/endpoints";
import { useSettings, aiRequestFields } from "../store/settings";
import { toast } from "../store/toast";
import { useMe } from "./queries";
import { personalizationText } from "../lib/personalize";
import type { GeneratedPrompt, MeResponse, Snapshot } from "../types";

export function useGeneratePrompts() {
  const region = useSettings((s) => s.region);
  const seasonalPrompts = useSettings((s) => s.seasonalPrompts);
  const aiProvider = useSettings((s) => s.aiProvider);
  const anthropicKey = useSettings((s) => s.anthropicKey);
  const { data } = useMe();
  const personalization = personalizationText(
    data?.snapshot?.profile,
    data?.snapshot?.gear ?? [],
    data?.snapshot?.history ?? [],
    data?.snapshot?.aurora?.facts ?? []
  );
  return useMutation({
    // Pass an optional idea/description for a trip → personalised prompt.
    // Follows the Aurora's-brain setting (Groq / bridge / own key).
    mutationFn: (idea?: string) => {
      const { provider, apiKey } = aiRequestFields(aiProvider, anthropicKey);
      return ai.generatePrompts(provider, { region, seasonalPrompts, personalization, idea }, apiKey);
    },
    onError: () => toast.error("Couldn't generate prompts — the server may be waking."),
  });
}

export function useSetActivePrompt() {
  const qc = useQueryClient();
  const holidayMode = useSettings((s) => s.holidayMode);
  const holidayDays = useSettings((s) => s.holidayDays);
  return useMutation({
    mutationFn: async (p: GeneratedPrompt) => {
      const me = qc.getQueryData<MeResponse>(["me"]);
      const snap: Snapshot = me?.snapshot ?? {};
      // Holiday mode: the filming clock starts now and runs `holidayDays`,
      // decoupled from the weekly Friday cycle. Otherwise clear any window so
      // the normal weekly countdown applies.
      const now = new Date();
      const deadline = new Date(now);
      deadline.setDate(deadline.getDate() + Math.max(1, holidayDays));
      const next: Snapshot = {
        ...snap,
        promptText: p.text,
        promptLevel: p.level,
        phase: "Filming",
        phaseDone: [],
        regensLeft: Math.max(0, (snap.regensLeft ?? 3) - 1),
        filmingStartedAt: holidayMode ? now.toISOString() : undefined,
        filmingDeadline: holidayMode ? deadline.toISOString() : undefined,
      };
      await session.sync(next as Record<string, unknown>);
      return next;
    },
    onSuccess: (next) => {
      qc.setQueryData<MeResponse>(["me"], (old) =>
        old ? { ...old, snapshot: next } : old
      );
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success(
        holidayMode
          ? `Project started — ${holidayDays} days on the clock.`
          : "Prompt locked in for this week."
      );
    },
    onError: () => toast.error("Couldn't set the prompt. Try again."),
  });
}
