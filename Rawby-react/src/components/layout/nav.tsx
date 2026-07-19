// Nav item definitions (icons from the shared SVG set).
import type { IconName } from "../ui/Icon";

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

// Aurora is intentionally NOT here — her floating chat head is the entry.
export const NAV_ITEMS: NavItem[] = [
  { to: "/home", label: "Home", icon: "home" },
  { to: "/prompts", label: "Prompts", icon: "clapper" },
  { to: "/leaderboard", label: "Ranks", icon: "trophy" },
  { to: "/atlas", label: "Atlas", icon: "globe" },
  { to: "/gear", label: "Gear", icon: "aperture" },
  { to: "/idea-bank", label: "Ideas", icon: "bulb" },
];

// RAW mode: only the tools that matter — no map, no gear, no leaderboard.
// Assistant joins the dock here since it's RAW's second core tool.
export const RAW_NAV_ITEMS: NavItem[] = [
  { to: "/home", label: "Home", icon: "home" },
  { to: "/prompts", label: "Prompts", icon: "clapper" },
  { to: "/idea-bank", label: "Ideas", icon: "bulb" },
  { to: "/assistant", label: "Assistant", icon: "sparkles" },
];

export const SECONDARY_ITEMS: NavItem[] = [
  { to: "/profile", label: "Profile", icon: "user" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

export const ADMIN_ITEM: NavItem = { to: "/admin", label: "Admin", icon: "shield" };

// Grouped for the desktop sidebar — editorial sections instead of one flat list.
export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  { items: [{ to: "/home", label: "Home", icon: "home" }] },
  {
    label: "Create",
    items: [
      { to: "/prompts", label: "Prompts", icon: "clapper" },
      { to: "/idea-bank", label: "Ideas", icon: "bulb" },
    ],
  },
  {
    label: "Progress",
    items: [
      { to: "/leaderboard", label: "Ranks", icon: "trophy" },
      { to: "/atlas", label: "Atlas", icon: "globe" },
      { to: "/gear", label: "Gear", icon: "aperture" },
    ],
  },
];
