// ============================================================
// RAWBY — Holiday mode. Trips are planned ahead with Aurora and
// auto-activate on their start date: the trip's prompt becomes the
// active prompt and `days` sets a custom filming window — so you can
// film a 4-day trip without waiting for the Friday cycle.
// ============================================================
import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchSnapshot, newId } from "../lib/snapshotPatch";
import { toast } from "../store/toast";
import { useMe } from "./queries";
import type { Trip } from "../types";

/** yyyy-mm-dd for an ISO/date string, in local time. */
function dayKey(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

/** Whole days from now until a trip's start (negative = already started). */
export function daysUntil(startDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((start.getTime() - today.getTime()) / 86_400_000);
}

export function useTrips() {
  const qc = useQueryClient();
  const { data } = useMe();
  const trips = (data?.snapshot?.trips ?? []).slice().sort((a, b) => a.startDate.localeCompare(b.startDate));

  const add = useMutation({
    mutationFn: (t: Omit<Trip, "id" | "status">) =>
      patchSnapshot(qc, (s) => ({
        ...s,
        trips: [...(s.trips ?? []), { ...t, id: newId(), status: "planned" as const }],
      })),
    onSuccess: () => toast.success("Trip saved — Aurora will line it up for the day."),
    onError: () => toast.error("Couldn't save the trip. Try again."),
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Trip> }) =>
      patchSnapshot(qc, (s) => ({
        ...s,
        trips: (s.trips ?? []).map((t) => (t.id === id ? { ...t, ...patch } : t)),
      })),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      patchSnapshot(qc, (s) => ({ ...s, trips: (s.trips ?? []).filter((t) => t.id !== id) })),
    onSuccess: () => toast.success("Trip removed."),
  });

  return { trips, add, update, remove };
}

/**
 * Fires once per mount: any planned trip whose start date has arrived becomes
 * the active prompt with a filming deadline = start + days. Keeps the most
 * recent due trip if several are overdue.
 */
export function useTripAutoActivate() {
  const qc = useQueryClient();
  const { data } = useMe();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !data?.snapshot) return;
    const trips = data.snapshot.trips ?? [];
    const todayKey = dayKey(new Date());
    const due = trips
      .filter((t) => t.status === "planned" && t.startDate <= todayKey)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    if (due.length === 0) return;
    ran.current = true;

    const trip = due[due.length - 1]; // newest due trip wins
    const start = new Date(`${trip.startDate}T00:00:00`);
    const deadline = new Date(start);
    deadline.setDate(deadline.getDate() + Math.max(1, trip.days));

    patchSnapshot(qc, (s) => ({
      ...s,
      promptText: trip.promptText || s.promptText,
      promptLevel: trip.promptLevel || s.promptLevel,
      phase: "Filming",
      phaseDone: [],
      filmingStartedAt: start.toISOString(),
      filmingDeadline: deadline.toISOString(),
      trips: (s.trips ?? []).map((t) =>
        t.id === trip.id ? { ...t, status: "active" as const, activatedAt: new Date().toISOString() } : t
      ),
    })).then(() => {
      toast.success(`${trip.title} starts today — filming window: ${trip.days} day${trip.days === 1 ? "" : "s"}.`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.snapshot]);
}
