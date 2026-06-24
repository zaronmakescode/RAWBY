import { useState } from "react";
import { PageTransition } from "../components/layout/PageTransition";
import { GlassCard } from "../components/ui/GlassCard";
import { GradientButton } from "../components/ui/GradientButton";
import { FilmTag } from "../components/ui/FilmTag";
import { Icon } from "../components/ui/Icon";
import { PageHeader, Spinner } from "../components/ui/Bits";
import { SubmitFilmModal } from "../components/SubmitFilmModal";
import { StartBigProjectModal } from "../components/StartBigProjectModal";
import { PromptDetailModal } from "../components/PromptDetailModal";
import { useMe } from "../hooks/queries";
import { useGeneratePrompts, useSetActivePrompt } from "../hooks/usePrompts";
import { useBigProject } from "../hooks/useBigProject";
import { useDraft } from "../hooks/usePersonal";
import { useSettings } from "../store/settings";
import { LEVELS, LATE_MULTIPLIERS, levelStyle } from "../lib/constants";
import type { GeneratedPrompt } from "../types";

function PromptCard({
  p,
  onFilm,
  onLock,
  onDetail,
  locking,
}: {
  p: GeneratedPrompt;
  onFilm: (level: string) => void;
  onLock: (p: GeneratedPrompt) => void;
  onDetail: (p: GeneratedPrompt) => void;
  locking?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const lv = levelStyle(p.level);
  return (
    <div>
      <GlassCard className="group relative flex h-full flex-col overflow-hidden transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-glow-sm">
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-70"
          style={{ background: `linear-gradient(90deg, transparent, ${lv.glow}, transparent)` }}
        />
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <FilmTag level={p.level} />
          <span className="rounded-full border border-hairline bg-chip px-2 py-0.5 text-[11px] font-semibold tabular-nums text-text-dim">
            {lv.points} pts
          </span>
        </div>
        <p className="text-sm leading-relaxed text-text-hi">{p.text}</p>
        {p.emotion && (
          <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-chip px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-text-dim">
            {p.emotion}
          </span>
        )}

        {(p.shots?.length || p.songs?.length) && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cinema-400 hover:underline"
          >
            {open ? "Hide" : "Shot & song ideas"}
            <Icon name="arrowRight" size={13} className={open ? "-rotate-90" : "rotate-90"} />
          </button>
        )}

        {open && (
          <div className="mt-3 space-y-3">
            {p.shots?.length ? (
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-dim">Shots</div>
                <ul className="space-y-1.5">
                  {p.shots.map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed text-text-dim">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-cinema-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {p.songs?.length ? (
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-dim">Songs</div>
                <ul className="space-y-1">
                  {p.songs.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-text-dim">
                      <Icon name="volume" size={12} className="shrink-0 text-cinema-500" />
                      <span className="text-text-hi">{s.title}</span> · {s.artist}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-4">
          <GradientButton onClick={() => onLock(p)} loading={locking} className="flex-1" title="Start the project — begins your filming window">
            <Icon name="check" size={15} /> Lock in
          </GradientButton>
          <GradientButton variant="ghost" onClick={() => onFilm(p.level)} title="Already filmed — submit now">
            <Icon name="film" size={15} />
          </GradientButton>
          <GradientButton variant="ghost" onClick={() => onDetail(p)} title="Open in detail">
            <Icon name="arrowRight" size={15} className="-rotate-45" />
          </GradientButton>
        </div>
      </GlassCard>
    </div>
  );
}

export default function Prompts() {
  const { data } = useMe();
  const snap = data?.snapshot;
  const region = useSettings((s) => s.region);
  const seasonalPrompts = useSettings((s) => s.seasonalPrompts);
  const gen = useGeneratePrompts();
  const prompts = gen.data ?? [];
  const big = useBigProject();
  const draft = useDraft();
  const setActive = useSetActivePrompt();

  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitLevel, setSubmitLevel] = useState("Short Story");
  const [submitDeadline, setSubmitDeadline] = useState<string | undefined>(undefined);
  const [bigOpen, setBigOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [idea, setIdea] = useState("");

  // In holiday mode the late penalty counts against your own filming window.
  const holiday = !!(snap?.filmingStartedAt && snap?.filmingDeadline);

  function film(level: string, deadline?: string) {
    setSubmitLevel(level);
    setSubmitDeadline(deadline ?? (holiday ? snap?.filmingDeadline : undefined));
    setSubmitOpen(true);
  }

  function openDetail(p: GeneratedPrompt) {
    draft.open.mutate(
      {
        promptText: p.text,
        level: p.level,
        storyline: "",
        shots: p.shots ?? [],
        music: (p.songs ?? []).map((s) => `${s.title} · ${s.artist}`),
        notes: "",
        gear: [],
      },
      { onSuccess: () => setDetailOpen(true) }
    );
  }

  return (
    <PageTransition>
      <SubmitFilmModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        defaultLevel={submitLevel}
        deadline={submitDeadline}
      />
      <StartBigProjectModal open={bigOpen} onClose={() => setBigOpen(false)} />
      <PromptDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} onFilm={film} />

      <PageHeader
        eyebrow="This week"
        title="Prompts"
        sub="Generate your weekly set, then film whichever level you want."
        right={
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-dim">
            <span className="inline-flex items-center gap-1 rounded-full bg-chip px-3 py-1">
              <Icon name="aperture" size={13} /> {region}
            </span>
            {seasonalPrompts && (
              <span className="inline-flex items-center gap-1 rounded-full bg-chip px-3 py-1">
                <Icon name="sun" size={13} /> Seasonal
              </span>
            )}
          </div>
        }
      />

      {/* Generate / Big Project actions */}
      <GlassCard className="relative mb-6 overflow-hidden p-6">
        <div
          className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgb(var(--glow) / 0.22), transparent 70%)" }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="h-display text-xl font-bold text-text-hi">This week's prompts</h2>
            <p className="text-sm text-text-dim">
              Three levels, tuned to {region === "Global" ? "anywhere" : region}
              {seasonalPrompts ? " and the season" : ""}. No need to pick — film any.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <GradientButton onClick={() => gen.mutate(undefined)} loading={gen.isPending}>
              <Icon name="sparkles" size={16} /> {prompts.length ? "Regenerate" : "Generate"}
            </GradientButton>
            <GradientButton variant="ghost" onClick={() => film("Short Story")}>
              <Icon name="plus" size={16} /> Write my own
            </GradientButton>
            {!big.project && (
              <GradientButton variant="story" onClick={() => setBigOpen(true)}>
                <Icon name="film" size={16} /> Start Big Project
              </GradientButton>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Describe an idea / trip → a personalised prompt */}
      <GlassCard className="mb-6">
        <label htmlFor="idea" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-dim">
          <Icon name="sparkles" size={13} /> Describe a trip or idea
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && idea.trim() && gen.mutate(idea)}
            placeholder="e.g. foggy weekend at Lake Balaton, just me + a 35mm"
            className="flex-1 rounded-xl border border-hairline bg-field px-4 py-3 text-sm text-text-hi outline-none placeholder:text-text-dim/60 focus:border-cinema-500/70"
          />
          <GradientButton onClick={() => idea.trim() && gen.mutate(idea)} loading={gen.isPending} disabled={!idea.trim()}>
            <Icon name="arrowRight" size={16} /> Make prompt
          </GradientButton>
        </div>
      </GlassCard>

      {/* Active Big Project */}
      {big.project && (
        <GlassCard className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2">
              <FilmTag level="Big Project" />
            </div>
            <h3 className="h-display text-lg font-bold text-text-hi">{big.project.title}</h3>
            <p className="text-sm text-text-dim">
              Your deadline · {new Date(big.project.deadline).toLocaleDateString()} (
              {Math.max(0, Math.ceil((new Date(big.project.deadline).getTime() - Date.now()) / 86_400_000))} days left)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <GradientButton variant="story" onClick={() => film("Big Project", big.project!.deadline)}>
              <Icon name="film" size={15} /> Submit project
            </GradientButton>
            <GradientButton variant="ghost" onClick={() => big.cancel.mutate()}>
              Drop
            </GradientButton>
          </div>
        </GlassCard>
      )}

      {/* Generated prompts (no forced choice) */}
      {gen.isPending ? (
        <Spinner label="Writing your weekly prompts…" />
      ) : prompts.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {prompts.map((p, i) => (
            <PromptCard
              key={i}
              p={p}
              onFilm={film}
              onLock={(pp) => setActive.mutate(pp)}
              onDetail={openDetail}
              locking={setActive.isPending}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="text-center">
          <p className="text-sm text-text-dim">
            {snap?.promptText
              ? snap.promptText
              : "Hit Generate to get this week's three prompts — set your country & season in Settings for tuned results."}
          </p>
        </GlassCard>
      )}

      {/* Levels & scoring */}
      <h3 className="h-display mb-3 mt-10 text-xl font-semibold text-text-hi">Levels &amp; scoring</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LEVELS.map((l) => (
          <GlassCard key={l.name} interactive className="group relative h-full overflow-hidden">
            <span
              className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-30 blur-2xl transition-opacity duration-300 group-hover:opacity-70"
              style={{ background: `radial-gradient(circle, ${l.glow}, transparent 70%)` }}
            />
            <div className="mb-3 h-1.5 w-12 rounded-full" style={{ background: l.glow }} />
            <div className="text-sm font-semibold text-text-hi">{l.name}</div>
            <div className="h-display mt-1 text-display-sm font-bold tabular-nums" style={{ color: l.glow }}>
              {l.points}
            </div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-text-dim">points</div>
          </GlassCard>
        ))}
      </div>

      {/* Late penalty */}
      <h3 className="h-display mb-3 mt-10 text-xl font-semibold text-text-hi">Late penalty</h3>
      <GlassCard>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {LATE_MULTIPLIERS.map((p) => (
            <div key={p.day} className="rounded-xl border border-hairline bg-chip p-3 text-center">
              <div className="text-xs uppercase tracking-wider text-text-dim">{p.day}</div>
              <div
                className="h-display mt-1 text-2xl font-bold"
                style={{ color: p.mult === 1 ? "#22C55E" : p.mult >= 0.75 ? "#FBBF24" : "#EF4444" }}
              >
                ×{p.mult}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </PageTransition>
  );
}
