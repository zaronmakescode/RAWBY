// ============================================================
// RAWBY — Atlas. Your filming world + everyone's best spots.
// Two layers: your film pins (accent dots) and shared shooting
// spots (teal diamonds) — curated icons + community submissions.
// Spots are there from day one, films fill in as you shoot.
// ============================================================
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageTransition } from "../components/layout/PageTransition";
import { GlassCard } from "../components/ui/GlassCard";
import { GradientButton } from "../components/ui/GradientButton";
import { PageHeader, Reveal } from "../components/ui/Bits";
import { Icon } from "../components/ui/Icon";
import { Modal } from "../components/ui/Modal";
import { WorldMap, type MapPin } from "../components/WorldMap";
import { useMe } from "../hooks/queries";
import { useAuth } from "../store/auth";
import { toast } from "../store/toast";
import { patchSnapshot } from "../lib/snapshotPatch";
import { spots as spotsApi } from "../lib/endpoints";
import { CURATED_SPOTS } from "../lib/spots";
import type { ProjectHistoryItem, Spot } from "../types";

const fieldCls =
  "w-full rounded-xl border border-hairline bg-field px-4 py-3 text-sm text-text-hi outline-none transition-colors placeholder:text-text-dim/60 focus:border-cinema-500/70";

function LayerChip({
  on,
  onClick,
  children,
  swatch,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  swatch: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        on ? "border-hairline-strong bg-chip text-text-hi" : "border-hairline text-text-dim opacity-60"
      }`}
    >
      <span className="h-2 w-2 rounded-sm" style={{ background: swatch }} />
      {children}
    </button>
  );
}

export default function Atlas() {
  const { data } = useMe();
  const qc = useQueryClient();
  const me = useAuth((s) => s.user);
  const history: ProjectHistoryItem[] = data?.snapshot?.history ?? data?.history ?? [];

  const pinned = history.filter((h) => h.location);
  const unpinned = history.filter((h) => !h.location);

  // Layers
  const [showFilms, setShowFilms] = useState(true);
  const [showSpots, setShowSpots] = useState(true);

  // Community spots (server) + curated (bundled)
  const spotsQ = useQuery({
    queryKey: ["spots"],
    queryFn: spotsApi.list,
    staleTime: 5 * 60_000,
  });
  const allSpots: Spot[] = useMemo(
    () => [...CURATED_SPOTS, ...(spotsQ.data ?? [])],
    [spotsQ.data]
  );

  // Film-pin picker (backfill) state
  const [target, setTarget] = useState<{ item: ProjectHistoryItem; idx: number } | null>(null);
  const [pick, setPick] = useState<{ lat: number; lng: number } | null>(null);
  const [place, setPlace] = useState("");

  // Spot submission state
  const [spotOpen, setSpotOpen] = useState(false);
  const [spotPick, setSpotPick] = useState<{ lat: number; lng: number } | null>(null);
  const [spotName, setSpotName] = useState("");
  const [spotNote, setSpotNote] = useState("");

  const saveFilmPin = useMutation({
    mutationFn: async () => {
      if (!target || !pick) return;
      const location = { ...pick, label: place.trim() || undefined };
      await patchSnapshot(qc, (snap) => {
        const hist = [...(snap.history ?? [])];
        const at = target.item.id
          ? hist.findIndex((h) => h.id === target.item.id)
          : target.idx;
        if (at >= 0 && at < hist.length) hist[at] = { ...hist[at], location };
        return { ...snap, history: hist };
      });
    },
    onSuccess: () => {
      toast.success("Pinned to your Atlas.");
      closeFilmPicker();
    },
    onError: () => toast.error("Couldn't save the pin — the server may be waking."),
  });

  const removeFilmPin = useMutation({
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

  const submitSpot = useMutation({
    mutationFn: () =>
      spotsApi.add({
        name: spotName.trim(),
        note: spotNote.trim() || undefined,
        lat: spotPick!.lat,
        lng: spotPick!.lng,
      }),
    onSuccess: () => {
      toast.success("Spot shared with every filmmaker on RAWBY.");
      qc.invalidateQueries({ queryKey: ["spots"] });
      closeSpotPicker();
    },
    onError: () => toast.error("Couldn't share the spot — try again."),
  });

  const removeSpot = useMutation({
    mutationFn: (id: string) => spotsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["spots"] }),
    onError: () => toast.error("Couldn't remove the spot."),
  });

  function closeFilmPicker() {
    setTarget(null);
    setPick(null);
    setPlace("");
  }
  function closeSpotPicker() {
    setSpotOpen(false);
    setSpotPick(null);
    setSpotName("");
    setSpotNote("");
  }

  const mapPins: MapPin[] = [
    ...(showFilms
      ? pinned.map((h) => ({
          lat: h.location!.lat,
          lng: h.location!.lng,
          title: h.title,
          label: h.location!.label,
          id: h.id,
          kind: "film" as const,
        }))
      : []),
    ...(showSpots
      ? allSpots.map((s) => ({
          lat: s.lat,
          lng: s.lng,
          title: s.name,
          label: s.note ?? (s.by ? `pinned by @${s.by}` : undefined),
          id: s.id,
          kind: "spot" as const,
        }))
      : []),
  ];

  const mySpots = (spotsQ.data ?? []).filter((s) => s.by && s.by === me?.username);

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Your filming world"
        eyebrowIcon="globe"
        title="Atlas"
        sub="Accent dots are your films. Teal diamonds are shooting spots — iconic places plus pins from other RAWBY filmmakers."
        right={
          <GradientButton variant="ghost" onClick={() => setSpotOpen(true)}>
            <Icon name="mapPin" size={15} /> Share a spot
          </GradientButton>
        }
      />

      {/* Layer toggles */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <LayerChip on={showFilms} onClick={() => setShowFilms((v) => !v)} swatch="rgb(var(--c-500))">
          My films · {pinned.length}
        </LayerChip>
        <LayerChip on={showSpots} onClick={() => setShowSpots((v) => !v)} swatch="#4fc3a1">
          Shooting spots · {allSpots.length}
        </LayerChip>
      </div>

      <GlassCard spotlight={false} className="overflow-hidden p-2 md:p-2.5">
        <WorldMap
          pins={mapPins}
          onPinClick={(p) => {
            if (p.kind === "spot") {
              const s = allSpots.find((x) => x.id === p.id);
              if (s) toast.info(`${s.name}${s.note ? ` — ${s.note}` : ""}${s.by ? ` (by @${s.by})` : ""}`);
              return;
            }
            const film = pinned.find((h) => (p.id ? h.id === p.id : h.title === p.title));
            if (film?.link) window.open(film.link, "_blank", "noopener,noreferrer");
            else if (film) toast.info(`${film.title}${film.location?.label ? ` — ${film.location.label}` : ""}`);
          }}
        />
      </GlassCard>

      {history.length === 0 && (
        <p className="mt-4 text-center text-sm text-text-dim">
          The diamonds are yours to chase — submit films and your own pins join them.
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
                    onClick={() => removeFilmPin.mutate(h)}
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

      {/* My shared spots */}
      {mySpots.length > 0 && (
        <Reveal className="mt-4">
          <GlassCard>
            <h3 className="h-display mb-3 text-display-sm font-semibold text-text-hi">
              Spots you've shared
            </h3>
            <ul className="divide-y divide-divide">
              {mySpots.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-text-hi">{s.name}</div>
                    {s.note && <div className="truncate text-xs text-text-dim">{s.note}</div>}
                  </div>
                  <button
                    onClick={() => removeSpot.mutate(s.id)}
                    className="shrink-0 text-xs text-text-dim transition-colors hover:text-danger"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </GlassCard>
        </Reveal>
      )}

      {/* Film-pin picker modal (backfill) */}
      <Modal
        open={!!target}
        onClose={closeFilmPicker}
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
            loading={saveFilmPin.isPending}
            onClick={() => saveFilmPin.mutate()}
          >
            <Icon name="mapPin" size={16} /> Save pin
          </GradientButton>
        </div>
      </Modal>

      {/* Share-a-spot modal */}
      <Modal open={spotOpen} onClose={closeSpotPicker} title="Share a shooting spot">
        <div className="space-y-4">
          <p className="text-sm text-text-dim">
            Tap where it is — every RAWBY filmmaker will see it on their Atlas.
          </p>
          <div className="overflow-hidden rounded-xl border border-hairline bg-field">
            <WorldMap
              interactive
              pins={spotPick ? [{ ...spotPick, kind: "spot", title: spotName || "New spot" }] : []}
              onPick={(lat, lng) => setSpotPick({ lat, lng })}
            />
          </div>
          {spotPick && (
            <>
              <input
                value={spotName}
                onChange={(e) => setSpotName(e.target.value)}
                placeholder="Spot name — e.g. Old dockyard cranes"
                className={fieldCls}
                aria-label="Spot name"
                maxLength={80}
              />
              <input
                value={spotNote}
                onChange={(e) => setSpotNote(e.target.value)}
                placeholder="Why it's good — light, angles, when to go (optional)"
                className={fieldCls}
                aria-label="Spot note"
                maxLength={200}
              />
            </>
          )}
          <GradientButton
            className="w-full"
            disabled={!spotPick || spotName.trim().length < 2}
            loading={submitSpot.isPending}
            onClick={() => submitSpot.mutate()}
          >
            <Icon name="mapPin" size={16} /> Share with everyone
          </GradientButton>
        </div>
      </Modal>
    </PageTransition>
  );
}
