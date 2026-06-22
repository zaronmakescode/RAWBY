import { useState } from "react";
import { motion } from "framer-motion";
import { PageTransition } from "../components/layout/PageTransition";
import { GlassCard } from "../components/ui/GlassCard";
import { GradientButton } from "../components/ui/GradientButton";
import { PageHeader, EmptyState } from "../components/ui/Bits";
import { Icon, type IconName } from "../components/ui/Icon";
import { stagger, item } from "../lib/motion";
import { GEAR_CATEGORIES } from "../lib/constants";
import { useGear } from "../hooks/useGear";

const CAT_ICON: Record<string, IconName> = {
  Camera: "camera",
  Audio: "mic",
  Lighting: "sun",
  Support: "aperture",
  Other: "film",
};

const fieldCls =
  "rounded-xl border border-hairline bg-field px-4 py-3 text-sm text-text-hi outline-none placeholder:text-text-dim/60 focus:border-cinema-500/70";

export default function Gear() {
  const { gear, add, remove } = useGear();
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState<string>(GEAR_CATEGORIES[0]);

  const byCat = GEAR_CATEGORIES.map((c) => ({
    cat: c,
    items: gear.filter((g) => g.category === c),
  })).filter((g) => g.items.length);

  function submit() {
    if (!brand.trim() && !type.trim()) return;
    add.mutate(
      { brand, type, category },
      { onSuccess: () => { setBrand(""); setType(""); } }
    );
  }

  return (
    <PageTransition>
      <PageHeader eyebrow="Toolkit" title="My gear" sub="Track what you own, tag what you used." />

      {/* Add gear — brand + type kept separate */}
      <GlassCard className="mb-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_1.3fr_auto_auto]">
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Brand (e.g. Sony)"
            className={fieldCls}
          />
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Type (e.g. A7 IV, 35mm lens, shotgun mic)"
            className={fieldCls}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={fieldCls}
          >
            {GEAR_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-ink-card">{c}</option>
            ))}
          </select>
          <GradientButton onClick={submit} loading={add.isPending} disabled={!brand.trim() && !type.trim()}>
            <Icon name="plus" size={16} /> Add
          </GradientButton>
        </div>
      </GlassCard>

      {/* Inventory grouped by category */}
      {gear.length === 0 ? (
        <EmptyState icon="aperture" title="No gear yet" sub="Add your kit above — then tag it on each film." />
      ) : (
        <div className="space-y-6">
          {byCat.map((group) => (
            <div key={group.cat}>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-hi">
                <Icon name={CAT_ICON[group.cat] ?? "film"} size={16} className="text-cinema-400" />
                {group.cat}
                <span className="text-xs font-normal text-text-dim">({group.items.length})</span>
              </div>
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
              >
                {group.items.map((g) => (
                  <motion.div key={g.id} variants={item}>
                    <GlassCard className="flex items-center justify-between py-3">
                      <span className="min-w-0 text-sm text-text-hi">
                        {g.brand && <span className="font-semibold">{g.brand}</span>}
                        {g.brand && g.type ? " " : ""}
                        <span className="text-text-dim">{g.type}</span>
                      </span>
                      <button
                        onClick={() => remove.mutate(g.id)}
                        aria-label="Remove gear"
                        className="shrink-0 text-text-dim transition-colors hover:text-danger"
                      >
                        <Icon name="plus" size={16} className="rotate-45" />
                      </button>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
