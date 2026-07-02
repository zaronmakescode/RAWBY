// ============================================================
// RAWBY — Atlas. A world map of everywhere you've filmed.
// Pins come from history items with a location; films without
// one can be backfilled here (pick a spot, name it, save).
// ============================================================
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PageTransition } from "../components/layout/PageTransition";
import { GlassCard } from "../components/ui/GlassCard";
import { TiltCard } from "../components/ui/TiltCard";
import { GradientButton } from "../components/ui/GradientButton";
import { PageHeader, EmptyState, Reveal } from "../components/ui/Bits";
import { Icon } from "../components/ui/Icon";
import { Modal } from "../components/ui/Modal";
import { WorldMap } from "../components/WorldMap";
import { useMe } from "../hooks/queries";
import { toast } from "../store/toast";
import { patchSnapshot } from "../lib/snapshotPatch";
import type { ProjectHistoryItem } from "../types";

const fieldCls =
  "w-full rounded-xl border border-hairline bg-field px-4 py-3 text-sm text-text-hi outline-none transition-colors placeholder:text-text-dim/60 focus:border-cinema-500/70";

export default function Atlas() {
  const { data } = useMe();
  const qc = useQueryClient();
  const history: ProjectHistoryItem[] = data?.snapshot?.history ?? data?.history ?? [];

  const pinned = history.filter((h) => h.location);
  const unpinned = history.filter((h) => !h.location);
  const places = new Set(
    pinned.map((h) => h.location!.label?.trim().toLowerCase()).filter(Boolean)
  ).size;

  // Backfill picker state — which film we're pinning + the picked spot.
  const [target, setTarget] = useState<{ item: ProjectHistoryItem; idx: number } | null>(null);
  const [pick, setPick] = useState<{ lat: number; lng: number } | null>(null);
  const [place, setPlace] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      if (!target || !pick) return;
      const location = { ...pick, label: place.trim() || undefined };
      await patchSnapshot(qc, (snap) => {
        const hist = [...(snap.history ?? [])];
        // Match by id when available, else by position (old items may lack ids).
        const at = target.item.id
          ? hist.findIndex((h) => h.id === target.item.id)
          : target.idx;
        if (at >= 0 && at < hist.length) hist[at] = { ...hist[at], location };
        return { ...snap, history: hist };
      });
    },
    onSuccess: () => {
      toast.success("Pinned to your Atlas.");
      closePicker();
    },
    onError: () => toast.error("Couldn't save the pin — the server may be waking."),
  });

  const removePin = useMutation({
    mutationFn: async (item: ProjectHistoryItem) => {
      await patchSnapshot(qc, (snap) => ({
        ...snap,
        history: (snap.history ?? []).map((h) =>
          (item.id ? h.id === item.id : h === item) ? { ...h, location: undefined } : h
        ),
      }));
    },
    onError: () => toast.error("Couldn't remove the pin."),
  });

  function closePicker() {
    setTarget(null);
    setPick(null);
    setPlace("");
  }

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Your filming world"
        eyebrowIcon="globe"
        title="Atlas"
        sub="Every pin is a film. Drop one when you submit — or backfill older work below."
        right={
          pinned.length > 0 ? (
            <div className="flex gap-2 text-xs">
              <span className="rounded-full border border-hairline bg-chip px-3 py-1.5 font-semibold tabular-nums text-text-dim">
                {pinned.length} {pinned.length === 1 ? "pin" : "pins"}
              </span>
              {places > 0 && (
                <span className="rounded-full border border-hairline bg-chip px-3 py-1.5 font-semibold tabular-nums text-text-dim">
                  {places} {places === 1 ? "place" : "places"}
                </span>
              )}
            </div>
          ) : undefined
        }
      />

      {history.length === 0 ? (
        <EmptyState
          doodle="reel"
          title="No films on the map yet"
          sub="Submit your first film and drop a pin where you shot it — your world fills in from there."
        />
      ) : (
        <>
          <TiltCard max={4} className="[perspective:1400px]">
            <GlassCard className="overflow-hidden p-2 md:p-3">
              <WorldMap
                pins={pinned.map((h) => ({
                  lat: h.location!.lat,
                  lng: h.location!.lng,
                  title: h.title,
                  label: h.location!.label,
                  id: h.id,
                }))}
                onPinClick={(p) => {
                  const film = pinned.find((h) => (p.id ? h.id === p.id : h.title === p.title));
                  if (film?.link) window.open(film.link, "_blank", "noopener,noreferrer");
                  else if (film) toast.info(`${film.title}${film.location?.label ? ` — ${film.location.label}` : ""}`);
                }}
              />
            </GlassCard>
          </TiltCard>

          {pinned.length === 0 && (
            <p className="mt-4 text-center text-sm text-text-dim">
              The map is waiting — pin your films below.
            </p>
          )}

          {/* Pinned films */}
          {pinned.length > 0 && (
            <Reveal className="mt-8">
              <GlassCard>
                <h3 className="h-display mb-3 text-display-sm font-semibold text-text-hi">
                  Pinned films
                </h3>
                <ul className="divide-y divide-divide">
                  {pinned.map((h, i) => (
                    <li key={h.id ?? `p${i}`} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-text-hi">{h.title}</div>
                        <div className="flex items-center gap-1.5 text-xs text-text-dim">
                          <Icon name="mapPin" size={12} />
                          {h.location!.label || `${h.location!.lat}°, ${h.location!.lng}°`}
                          {h.date ? ` · ${h.date}` : ""}
                        </div>
                      </div>
                      <button
                        onClick={() => removePin.mutate(h)}
                        aria-label={`Remove pin for ${h.title}`}
                        className="shrink-0 text-xs text-text-dim transition-colors hover:text-danger"
                      >
                        Unpin
                      </button>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </Reveal>
          )}

          {/* Backfill — films with no location yet */}
          {unpinned.length > 0 && (
            <Reveal className="mt-4">
              <GlassCard>
                <h3 className="h-display mb-1 text-display-sm font-semibold text-text-hi">
                  Not on the map yet
                </h3>
                <p className="mb-3 text-xs text-text-dim">
                  Add a pin to older films to complete your Atlas.
                </p>
                <ul className="divide-y divide-divide">
                  {unpinned.map((h, i) => (
                    <li key={h.id ?? `u${i}`} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-text-hi">{h.title}</div>
                        <div className="text-xs text-text-dim">
                          {h.level}
                          {h.date ? ` · ${h.date}` : ""}
                        </div>
                      </div>
                      <button
                        onClick={() => setTarget({ item: h, idx: history.indexOf(h) })}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-cinema-500/15 px-3 py-1.5 text-xs font-semibold text-cinema-300 transition-colors hover:bg-cinema-500/25"
                      >
                        <Icon name="mapPin" size={13} /> Add pin
                      </button>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </Reveal>
          )}
        </>
      )}

      {/* Pin picker modal (backfill) */}
      <Modal
        open={!!target}
        onClose={closePicker}
        title={target ? `Pin “${target.item.title}”` : "Pin film"}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-dim">Tap the map where you filmed it.</p>
          <div className="overflow-hidden rounded-xl border border-hairline bg-field">
            <WorldMap
              interactive
              pins={pick ? [{ ...pick, label: place || undefined }] : []}
              onPick={(lat, lng) => setPick({ lat, lng })}
            />
          </div>
          {pick && (
            <input
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="Name the place — e.g. Budapest, riverside"
              className={fieldCls}
              aria-label="Place name"
            />
          )}
          <GradientButton
            className="w-full"
            disabled={!pick}
            loading={save.isPending}
            onClick={() => save.mutate()}
          >
            <Icon name="mapPin" size={16} /> Save pin
          </GradientButton>
        </div>
      </Modal>
    </PageTransition>
  );
}
