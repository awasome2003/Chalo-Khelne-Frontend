import {
  LayoutDashboard, Trophy, Users, Grid3X3, Swords, Radio,
  Newspaper, MessageSquare, Shield, CreditCard, Tag,
  Settings, BarChart3, Megaphone, Dumbbell, MapPin,
} from "lucide-react";

/**
 * Sidebar navigation config.
 * Add/remove items here — UI auto-updates.
 * Roles: "manager" | "clubadmin" | "superadmin" | "trainer"
 */
export const SIDEBAR_SECTIONS = [
  {
    key: "main",
    label: null, // No section header
    items: [
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/mdashboard", roles: ["manager"] },
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/club-dashboard", roles: ["clubadmin"] },
    ],
  },
  {
    key: "tournament",
    label: "Tournament",
    items: [
      { key: "tournaments", label: "Tournaments", icon: Trophy, path: "/mtournament-management", roles: ["manager"] },
    ],
  },
  {
    key: "facility",
    label: "Facility",
    items: [
      { key: "turfs", label: "Turf Management", icon: MapPin, path: "/add-turf", roles: ["manager"] },
      { key: "turfs", label: "Turf Management", icon: MapPin, path: "/turf-management", roles: ["clubadmin"] },
      { key: "bookings", label: "Slot Booking", icon: Grid3X3, path: "/mslot-Bookingt", roles: ["manager"] },
    ],
  },
  {
    key: "management",
    label: "Management",
    items: [
      { key: "social", label: "Social", icon: MessageSquare, path: "/msocial", roles: ["manager"] },
      { key: "social", label: "Social", icon: MessageSquare, path: "/club-social", roles: ["clubadmin"] },
      { key: "referee", label: "Referee", icon: Shield, path: "/mrefree", roles: ["manager"] },
      { key: "referee", label: "Referee", icon: Shield, path: "/club-refree", roles: ["clubadmin"] },
      { key: "trainers", label: "Trainers", icon: Dumbbell, path: "/mtrainers", roles: ["manager"] },
      { key: "news", label: "News", icon: Newspaper, path: "/mnews", roles: ["manager"] },
      { key: "staff", label: "Staff Admin", icon: Users, path: "/staff-admin", roles: ["clubadmin"] },
    ],
  },
  {
    key: "finance",
    label: "Finance",
    items: [
      { key: "payments", label: "Payments", icon: CreditCard, path: "/payments", roles: ["manager"] },
      { key: "payments", label: "Payments", icon: CreditCard, path: "/payment-history", roles: ["clubadmin"] },
      { key: "coupons", label: "Coupons", icon: Tag, path: "/mcoupons", roles: ["manager"] },
      { key: "finance", label: "Financial Overview", icon: BarChart3, path: "/club-finance", roles: ["clubadmin"] },
    ],
  },
  {
    key: "settings",
    label: null,
    items: [
      { key: "settings", label: "Settings", icon: Settings, path: "/msettings", roles: ["manager"] },
    ],
  },
];

/**
 * Filter sections by role.
 */
export function getSidebarForRole(role) {
  return SIDEBAR_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);
}
