import { Icon, type IconName } from "./Icon";

interface Props {
  icon: IconName;
  value: React.ReactNode;
  label: string;
  accent?: string;
}

// Static info tile — no entrance animation (it could freeze mid-stagger).
export function StatTile({ icon, value, label, accent = "#E8B647" }: Props) {
  return (
    <div className="glass flex flex-col gap-3 p-4">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ background: `${accent}1f`, color: accent }}
      >
        <Icon name={icon} size={18} />
      </div>
      <div className="h-display text-[1.75rem] font-bold leading-none text-text-hi tabular-nums">
        {value}
      </div>
      <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-text-dim">
        {label}
      </div>
    </div>
  );
}
