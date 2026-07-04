import { useNavigate } from "react-router-dom";
import { PageTransition } from "../components/layout/PageTransition";
import { GlassCard } from "../components/ui/GlassCard";
import { GradientButton } from "../components/ui/GradientButton";
import { PageHeader } from "../components/ui/Bits";
import { Icon } from "../components/ui/Icon";
import { ThemeControls } from "../components/ui/ThemeControls";
import { useAuth } from "../store/auth";
import { useSettings, COUNTRIES } from "../store/settings";
import { DAY_NAMES } from "../lib/constants";
import { BASE_URL } from "../lib/api";

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <div className="text-sm font-semibold text-text-hi">{label}</div>
        {sub && <div className="text-xs text-text-dim">{sub}</div>}
      </div>
      {children}
    </div>
  );
}

/** Standard switch row — one look for every boolean setting. */
function Toggle({
  label,
  sub,
  on,
  onChange,
}: {
  label: string;
  sub?: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-hairline bg-chip px-4 py-3 text-left transition-colors hover:border-hairline-strong"
    >
      <div>
        <div className="text-sm font-medium text-text-hi">{label}</div>
        {sub && <div className="text-xs text-text-dim">{sub}</div>}
      </div>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          on ? "bg-cinema-500" : "bg-hairline-strong"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

/** Slider row with a live value readout. */
function SliderRow({
  label,
  sub,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  sub?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-chip px-4 py-3">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-text-hi">{label}</div>
          {sub && <div className="text-xs text-text-dim">{sub}</div>}
        </div>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-cinema-400">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-hairline-strong accent-[rgb(var(--c-500))]"
      />
    </div>
  );
}

export default function Settings() {
  const nav = useNavigate();
  const logout = useAuth((s) => s.logout);
  const user = useAuth((s) => s.user);
  const s = useSettings();

  return (
    <PageTransition>
      <PageHeader eyebrow="Preferences" title="Settings" />

      {/* Theme */}
      <GlassCard className="mb-4">
        <ThemeControls />
      </GlassCard>

      {/* Backdrop & effects */}
      <GlassCard className="mb-4 space-y-3">
        <div className="flex items-center gap-2">
          <Icon name="film" size={18} className="text-cinema-400" />
          <div>
            <div className="text-sm font-semibold text-text-hi">Backdrop & effects</div>
            <div className="text-xs text-text-dim">
              The living background behind everything — tune it to taste.
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-hairline bg-chip px-4 py-3">
          <div className="mb-2.5">
            <div className="text-sm font-medium text-text-hi">Backdrop</div>
            <div className="text-xs text-text-dim">
              Animated scene, real footage, or one flat colour.
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(
              [
                { id: "shader", label: "Animated" },
                { id: "video", label: "Footage" },
                { id: "solid", label: "Minimal" },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => s.setBgMode(m.id)}
                aria-pressed={s.bgMode === m.id}
                className={`rounded-lg py-2 text-xs font-semibold transition-colors ${
                  s.bgMode === m.id
                    ? "bg-cinema-500 text-[#16161a]"
                    : "bg-field text-text-dim hover:text-text-hi"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        {s.bgMode === "shader" && (
          <SliderRow
            label="Backdrop motion"
            sub="How fast the scene drifts."
            value={s.bgSpeed}
            min={0.25}
            max={2}
            step={0.05}
            format={(v) => `${v.toFixed(2)}×`}
            onChange={s.setBgSpeed}
          />
        )}
        {s.bgMode !== "solid" && (
          <SliderRow
            label="Backdrop dim"
            sub="Darkens the backdrop so cards + text stay readable."
            value={s.bgDim}
            min={0.1}
            max={0.85}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={s.setBgDim}
          />
        )}
        <SliderRow
          label="Film grain"
          sub="The analog texture over the app. 0 turns it off."
          value={s.grainAmount}
          min={0}
          max={2}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={s.setGrainAmount}
        />
        <Toggle
          label="Reduce animations"
          sub="Calms transitions and freezes the backdrop."
          on={s.reduceMotion}
          onChange={s.setReduceMotion}
        />
      </GlassCard>

      {/* Home layout */}
      <GlassCard className="mb-4 space-y-3">
        <div className="flex items-center gap-2">
          <Icon name="home" size={18} className="text-cinema-400" />
          <div>
            <div className="text-sm font-semibold text-text-hi">Home layout</div>
            <div className="text-xs text-text-dim">Choose which sections your dashboard shows.</div>
          </div>
        </div>
        <Toggle
          label="Videography breakdown"
          sub="Category stats for your films."
          on={s.showCategories}
          onChange={s.setShowCategories}
        />
        <Toggle
          label="Holiday mode card"
          sub="Trips planned with Aurora."
          on={s.showTrips}
          onChange={s.setShowTrips}
        />
        <Toggle
          label="Weekly steps"
          sub="The production stepper."
          on={s.showSteps}
          onChange={s.setShowSteps}
        />
        <Toggle
          label="Recent films + Aurora"
          sub="Latest submissions and the co-pilot card."
          on={s.showRecent}
          onChange={s.setShowRecent}
        />
        <div className="rounded-xl border border-hairline bg-chip px-4 py-3">
          <div className="mb-2.5">
            <div className="text-sm font-medium text-text-hi">Navigation</div>
            <div className="text-xs text-text-dim">
              Bottom dock, or a left sidebar that types out the page names on hover (desktop).
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {(
              [
                { id: "bottom", label: "Bottom dock" },
                { id: "left", label: "Left sidebar" },
              ] as const
            ).map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => s.setNavSide(n.id)}
                aria-pressed={s.navSide === n.id}
                className={`rounded-lg py-2 text-xs font-semibold transition-colors ${
                  s.navSide === n.id
                    ? "bg-cinema-500 text-[#16161a]"
                    : "bg-field text-text-dim hover:text-text-hi"
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Prompt tuning */}
      <GlassCard className="mb-4 space-y-5">
        <div>
          <div className="text-sm font-semibold text-text-hi">Prompt tuning</div>
          <div className="text-xs text-text-dim">Where you are + the season shape your prompts.</div>
        </div>
        <div>
          <label htmlFor="set-region" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-dim">
            Country / region
          </label>
          <input
            id="set-region"
            list="country-list"
            value={s.region}
            onChange={(e) => s.setRegion(e.target.value)}
            placeholder="e.g. Hungary"
            className="w-full rounded-xl border border-hairline bg-field px-4 py-3 text-sm text-text-hi outline-none focus:border-cinema-500/70"
          />
          <datalist id="country-list">
            {COUNTRIES.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>
        <Toggle
          label="Seasonal prompts"
          sub="Tune ideas to the time of year."
          on={s.seasonalPrompts}
          onChange={s.setSeasonal}
        />
        <div className="rounded-xl border border-hairline bg-chip px-4 py-3">
          <div className="mb-2.5">
            <div className="text-sm font-medium text-text-hi">Cycle starts on</div>
            <div className="text-xs text-text-dim">
              Your week runs {DAY_NAMES[s.cycleDay]} → {DAY_NAMES[s.cycleDay]}. Prompt day, filming
              window and the countdown all follow it.
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {DAY_NAMES.map((d, i) => (
              <button
                key={d}
                type="button"
                onClick={() => s.setCycleDay(i)}
                aria-pressed={s.cycleDay === i}
                title={d}
                className={`rounded-lg py-2 text-xs font-semibold transition-colors ${
                  s.cycleDay === i
                    ? "bg-cinema-500 text-[#16161a]"
                    : "bg-field text-text-dim hover:text-text-hi"
                }`}
              >
                {d.slice(0, 2)}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Holiday mode */}
      <GlassCard className="mb-4 space-y-4">
        <div className="flex items-center gap-2">
          <Icon name="sun" size={18} className="text-cinema-400" />
          <div>
            <div className="text-sm font-semibold text-text-hi">Holiday mode</div>
            <div className="text-xs text-text-dim">
              Summer schedule's off? Skip the {DAY_NAMES[s.cycleDay]} cycle — your filming clock
              starts when you lock in a prompt and runs a fixed window.
            </div>
          </div>
        </div>
        <Toggle
          label="Start the clock on lock-in"
          sub="Countdown begins when you start, not on Friday."
          on={s.holidayMode}
          onChange={s.setHolidayMode}
        />
        {s.holidayMode && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-hairline bg-chip px-4 py-3">
            <div>
              <div className="text-sm font-medium text-text-hi">Filming window</div>
              <div className="text-xs text-text-dim">Days you get once a project starts.</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => s.setHolidayDays(s.holidayDays - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline text-text-hi transition-colors hover:border-cinema-500/70"
                aria-label="Fewer days"
              >
                <Icon name="plus" size={14} className="rotate-45" />
              </button>
              <span className="h-display w-10 text-center text-lg font-bold tabular-nums text-text-hi">
                {s.holidayDays}
              </span>
              <button
                onClick={() => s.setHolidayDays(s.holidayDays + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline text-text-hi transition-colors hover:border-cinema-500/70"
                aria-label="More days"
              >
                <Icon name="plus" size={14} />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Aurora brain */}
      <GlassCard className="mb-4 space-y-4">
        <div className="flex items-center gap-2">
          <Icon name="sparkles" size={18} className="text-cinema-400" />
          <div>
            <div className="text-sm font-semibold text-text-hi">Aurora's brain</div>
            <div className="text-xs text-text-dim">
              Powers chat, weekly prompts and skill feedback. Anything Claude falls back to Groq
              if it can't be reached.
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {(
            [
              {
                id: "groq",
                label: "Groq",
                sub: "Free and fast. Decent, not brilliant.",
              },
              {
                id: "bridge",
                label: "Claude bridge",
                sub: "The owner's Claude subscription via the bridge service — see claude-bridge/README.",
              },
              {
                id: "apikey",
                label: "My Anthropic API key",
                sub: "Best answers, your usage. Key stays on this device and is only sent with your requests.",
              },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => s.setAiProvider(p.id)}
              aria-pressed={s.aiProvider === p.id}
              className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-colors ${
                s.aiProvider === p.id
                  ? "border-cinema-500/60 bg-cinema-500/[0.08]"
                  : "border-hairline bg-chip hover:border-hairline-strong"
              }`}
            >
              <div>
                <div className="text-sm font-medium text-text-hi">{p.label}</div>
                <div className="text-xs text-text-dim">{p.sub}</div>
              </div>
              <span
                className={`h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
                  s.aiProvider === p.id ? "border-cinema-500 bg-cinema-500" : "border-hairline-strong"
                }`}
              />
            </button>
          ))}
        </div>
        {s.aiProvider === "apikey" && (
          <div>
            <label htmlFor="anthropic-key" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-dim">
              Anthropic API key
            </label>
            <input
              id="anthropic-key"
              type="password"
              value={s.anthropicKey}
              onChange={(e) => s.setAnthropicKey(e.target.value)}
              placeholder="sk-ant-…"
              autoComplete="off"
              className="w-full rounded-xl border border-hairline bg-field px-4 py-3 text-sm text-text-hi outline-none focus:border-cinema-500/70"
            />
            <p className="mt-1.5 text-[11px] text-text-dim">
              Create one at console.anthropic.com. Stored only in this browser; sent over HTTPS
              with each request and never saved on the server.
            </p>
          </div>
        )}
      </GlassCard>

      <GlassCard className="divide-y divide-divide">
        <Row label="Account" sub={user ? `@${user.username} · ${user.email ?? "no email"}` : "—"}>
          <span className="text-xs text-text-dim">{user?.displayName}</span>
        </Row>

        <Row label="API endpoint" sub="Backend the app talks to">
          <code className="rounded bg-field px-2 py-1 text-xs text-text-dim">{BASE_URL}</code>
        </Row>
      </GlassCard>

      <div className="mt-6">
        <GradientButton
          variant="ghost"
          className="!text-danger"
          onClick={() => {
            logout();
            nav("/login", { replace: true });
          }}
        >
          <Icon name="logout" size={16} /> Sign out
        </GradientButton>
      </div>

      <p className="mt-8 text-center text-xs text-text-dim">
        RAWBY · cinematic weekly film challenge · React web client
      </p>
    </PageTransition>
  );
}
