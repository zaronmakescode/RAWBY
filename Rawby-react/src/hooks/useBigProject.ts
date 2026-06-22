// Personal Big Project — a longer film with the user's own deadline,
// worked on over time, then submitted (not an instant submission).
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchSnapshot, newId } from "../lib/snapshotPatch";
import { toast } from "../store/toast";
import { useMe } from "./queries";
import type { BigProject } from "../types";

export function useBigProject() {
  const qc = useQueryClient();
  const { data } = useMe();
  const project: BigProject | undefined = data?.snapshot?.bigProject;

  const start = useMutation({
    mutationFn: (input: { title: string; deadline: string }) =>
      patchSnapshot(qc, (s) => ({
        ...s,
        bigProject: {
          id: newId(),
          title: input.title.trim(),
          deadline: input.deadline,
          startedAt: new Date().toISOString(),
        },
      })),
    onSuccess: () => toast.success("Big Project started — take your time."),
    onError: () => toast.error("Couldn't start the project"),
  });

  const cancel = useMutation({
    mutationFn: () => patchSnapshot(qc, (s) => ({ ...s, bigProject: undefined })),
  });

  return { project, start, cancel };
}
