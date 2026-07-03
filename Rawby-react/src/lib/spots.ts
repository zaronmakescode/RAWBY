// ============================================================
// RAWBY — curated shooting spots. Hungary-first (that's where
// the filmmakers are right now); world packs come as the
// community grows. Community spots from the server render
// alongside these on the Atlas.
// ============================================================
import type { Spot } from "../types";

export const CURATED_SPOTS: Spot[] = [
  // ── Budapest ──
  { id: "hu-parliament", curated: true, name: "Parliament from Bem rakpart", lat: 47.505, lng: 19.045, note: "Golden hour across the Danube — the classic wide. Blue hour doubles the lights in the water." },
  { id: "hu-bastion", curated: true, name: "Fisherman's Bastion", lat: 47.502, lng: 19.034, note: "Arches frame the city. Go at sunrise — empty terraces, warm side light." },
  { id: "hu-chain-bridge", curated: true, name: "Chain Bridge lion terrace", lat: 47.499, lng: 19.043, note: "Low angle through the chains at night; car light-trails for free production value." },
  { id: "hu-gellert", curated: true, name: "Gellért Hill lookout", lat: 47.484, lng: 19.046, note: "Highest city panorama. Fog mornings in autumn are cinema." },
  { id: "hu-ruin-bars", curated: true, name: "Szimpla Kert / ruin bar district", lat: 47.497, lng: 19.063, note: "Texture heaven — neon, decay, fairy lights. Ask before filming inside." },
  { id: "hu-keleti", curated: true, name: "Keleti station hall", lat: 47.5, lng: 19.083, note: "Iron-and-glass cathedral light at midday. Great for arrival/departure beats." },
  { id: "hu-margit", curated: true, name: "Margaret Island water tower", lat: 47.527, lng: 19.049, note: "Green tunnel paths, runners at dawn, the old tower — a quiet-story backlot." },
  { id: "hu-metro", curated: true, name: "M4 metro stations (Szent Gellért tér)", lat: 47.482, lng: 19.052, note: "Brutalist concrete + light wells. Tripods need a permit; handheld is tolerated." },
  // ── Around the country ──
  { id: "hu-tihany", curated: true, name: "Tihany Abbey, Balaton", lat: 46.914, lng: 17.888, note: "Twin towers over the lake; lavender fields bloom late June." },
  { id: "hu-balaton-north", curated: true, name: "Badacsony basalt hills", lat: 46.79, lng: 17.494, note: "Vineyard slopes + moody volcanic ridges above Balaton. Best in harvest fog." },
  { id: "hu-hortobagy", curated: true, name: "Hortobágy puszta", lat: 47.582, lng: 21.152, note: "Hungary's big-sky steppe — mirages in summer, grey cattle, nine-hole bridge." },
  { id: "hu-hollóko", curated: true, name: "Hollókő old village", lat: 47.995, lng: 19.593, note: "UNESCO Palóc village — whitewashed walls, period texture without a set budget." },
  { id: "hu-eger", curated: true, name: "Eger castle + minaret", lat: 47.906, lng: 20.377, note: "Baroque streets and castle walls; warm stone at sunset." },
  { id: "hu-lillafured", curated: true, name: "Lillafüred palace + waterfall", lat: 48.102, lng: 20.62, note: "Neo-renaissance palace, hanging gardens, Hungary's tallest waterfall next door." },
  { id: "hu-esztergom", curated: true, name: "Esztergom Basilica from Danube bend", lat: 47.799, lng: 18.737, note: "The dome over the river — shoot from Štúrovo side for the full postcard." },
  { id: "hu-szentendre", curated: true, name: "Szentendre riverside lanes", lat: 47.668, lng: 19.076, note: "Mediterranean-feeling alleys 40 min from Pest. Painters' light all day." },
  { id: "hu-tokaj", curated: true, name: "Tokaj vineyards", lat: 48.123, lng: 21.41, note: "Terraced wine hills over the Bodrog; October colours are unreal." },
  { id: "hu-pecs", curated: true, name: "Pécs — Zsolnay quarter", lat: 46.073, lng: 18.238, note: "Ceramic-tiled facades + industrial-romantic courtyards in the south's warmest light." },
];
