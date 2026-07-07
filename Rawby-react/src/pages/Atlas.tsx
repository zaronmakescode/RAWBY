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
import { MapView, type MapPin } from "../components/MapView";
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

  // Selected pin → a proper detail card under the map (not a toast dump)
  interface Selected {
    kind: "spot" | "film";
    title: string;
    note?: string;
    place?: string;
    link?: string;
    by?: string;
    lat: number;
    lng: number;
  }
  const [selected, setSelected] = useState<Selected | null>(null);

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

      <GlassCard spotlight={false} className="overflow-hidden p-1.5">
        <MapView
          className="h-[64vh] min-h-[400px] w-full overflow-hidden rounded-xl"
          pins={mapPins}
          onPinClick={(p) => {
            if (p.kind === "spot") {
              const s = allSpots.find((x) => x.id === p.id);
              if (s) setSelected({ kind: "spot", title: s.name, note: s.note ?? undefined, by: s.by, lat: s.lat, lng: s.lng });
              return;
            }
            const film = pinned.find((h) => (p.id ? h.id === p.id : h.title === p.title));
            if (film)
              setSelected({
                kind: "film",
                title: film.title,
                place: film.location?.label,
                link: film.link,
                lat: film.location!.lat,
                lng: film.location!.lng,
              });
          }}
        />
      </GlassCard>

      {/* Selected pin — a designed detail card, not a toast */}
      {selected && (
        <Reveal className="mt-3">
          <GlassCard className="relative flex items-start gap-3.5 p-4">
            <span
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                color: selected.kind === "spot" ? "#4fc3a1" : "rgb(var(--c-500))",
                background: selected.kind === "spot" ? "#4fc3a11a" : "rgb(var(--c-500) / 0.12)",
              }}
            >
              <Icon name={selected.kind === "spot" ? "mapPin" : "film"} size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-dim">
                  {selected.kind === "spot" ? "Shooting spot" : "Your film"}
                </span>
                {selected.by && (
                  <span className="rounded-full bg-chip px-2 py-0.5 text-[10px] font-medium text-text-dim">
                    @{selected.by}
                  </span>
                )}
              </div>
              <h4 className="h-display mt-0.5 truncate text-lg font-bold text-text-hi">{selected.title}</h4>
              {(selected.note || selected.place) && (
                <p className="measure mt-1 text-sm leading-relaxed text-text-dim">
                  {selected.note ?? selected.place}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {selected.kind === "film" && selected.link && (
                  <a href={selected.link} target="_blank" rel="noreferrer">
                    <GradientButton className="!py-2 text-xs">
                      <Icon name="film" size={14} /> Open reel
                    </GradientButton>
                  </a>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-chip px-3 py-1.5 text-xs font-medium text-text-dim transition-colors hover:text-text-hi"
                >
                  <Icon name="arrowRight" size={13} className="-rotate-45" /> Open in Maps
                </a>
                <span className="text-[11px] tabular-nums text-text-dim/70">
                  {selected.lat.toFixed(3)}°, {selected.lng.toFixed(3)}°
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              aria-label="Close details"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-glass hover:text-text-hi"
            >
              <Icon name="plus" size={16} className="rotate-45" />
            </button>
          </GlassCard>
        </Reveal>
      )}

      {history.length === 0 && !selected && (
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
            <MapView
              className="h-[300px] w-full"
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
            <MapView
              className="h-[300px] w-full"
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
