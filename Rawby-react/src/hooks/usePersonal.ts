// Profile (onboarding), quick note, and the active prompt-detail draft —
// all stored in the snapshot blob and synced.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchSnapshot } from "../lib/snapshotPatch";
import { toast } from "../store/toast";
import { useMe } from "./queries";
import type { AuroraMemory, ChatMessage, PromptWorkspace, UserProfile, Visibility } from "../types";

const MAX_THREAD = 40; // cap persisted chat turns so the snapshot stays small

export const DEFAULT_VISIBILITY: Visibility = {
  publicProfile: true,
  showScore: true,
  showStreak: true,
  showRank: true,
  showFilms: true,
  showGear: false,
};

export function useVisibility() {
  const qc = useQueryClient();
  const { data } = useMe();
  const visibility: Visibility = { ...DEFAULT_VISIBILITY, ...(data?.snapshot?.visibility ?? {}) };
  const set = useMutation({
    mutationFn: (patch: Partial<Visibility>) =>
      patchSnapshot(qc, (s) => ({
        ...s,
        visibility: { ...DEFAULT_VISIBILITY, ...(s.visibility ?? {}), ...patch },
      })),
  });
  return { visibility, set };
}

export function useProfile() {
  const qc = useQueryClient();
  const { data } = useMe();
  const profile = data?.snapshot?.profile;
  const save = useMutation({
    mutationFn: (p: UserProfile) =>
      patchSnapshot(qc, (s) => ({ ...s, profile: { ...(s.profile ?? {}), ...p, completed: true } })),
    onSuccess: () => toast.success("Saved — Aurora will use this."),
  });
  return { profile, save };
}

export function useNote() {
  const qc = useQueryClient();
  const { data } = useMe();
  const note = data?.snapshot?.note ?? "";
  const save = useMutation({
    mutationFn: (text: string) => patchSnapshot(qc, (s) => ({ ...s, note: text })),
  });
  return { note, save };
}

/**
 * Aurora's long-term memory. `messages` is the persisted chat thread (so Aurora
 * remembers past conversations); `facts` are durable things she's learned.
 */
export function useAurora() {
  const qc = useQueryClient();
  const { data } = useMe();
  const memory: AuroraMemory = data?.snapshot?.aurora ?? {};

  const saveThread = useMutation({
    mutationFn: (messages: ChatMessage[]) =>
      patchSnapshot(qc, (s) => ({
        ...s,
        aurora: { ...(s.aurora ?? {}), messages: messages.slice(-MAX_THREAD) },
      })),
  });

  const addFact = useMutation({
    mutationFn: (fact: string) =>
      patchSnapshot(qc, (s) => {
        const facts = s.aurora?.facts ?? [];
        if (facts.includes(fact)) return s;
        return { ...s, aurora: { ...(s.aurora ?? {}), facts: [...facts, fact] } };
      }),
  });

  return { memory, facts: memory.facts ?? [], thread: memory.messages ?? [], saveThread, addFact };
}

export function useDraft() {
  const qc = useQueryClient();
  const { data } = useMe();
  const draft = data?.snapshot?.activeDraft;
  const open = useMutation({
    mutationFn: (d: PromptWorkspace) => patchSnapshot(qc, (s) => ({ ...s, activeDraft: d })),
  });
  const update = useMutation({
    mutationFn: (patch: Partial<PromptWorkspace>) =>
      patchSnapshot(qc, (s) => ({
        ...s,
        activeDraft: { ...(s.activeDraft as PromptWorkspace), ...patch },
      })),
  });
  const clear = useMutation({
    mutationFn: () => patchSnapshot(qc, (s) => ({ ...s, activeDraft: undefined })),
  });
  return { draft, open, update, clear };
}
