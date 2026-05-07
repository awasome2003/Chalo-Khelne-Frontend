import {
  LayoutDashboard, Trophy, Hash, Newspaper, CreditCard, Tag, Bell, Settings,
  Briefcase, Dumbbell, Shield, Users, MapPin, MessageCircle, Home, Building2,
  ClipboardCheck, BookOpen, ShieldCheck, Store, Calendar, User,
} from "lucide-react";

const action = (id, label, route, icon, keywords = "") => ({
  id,
  label,
  route,
  icon,
  keywords: (label + " " + keywords).toLowerCase(),
});

export const ROLE_ACTIONS = {
  manager: [
    action("m-dash", "Go to Dashboard", "/mdashboard", LayoutDashboard, "home overview"),
    action("m-tour", "Go to Tournaments", "/mtournament-management", Trophy, "fixtures brackets"),
    action("m-staff", "Open staff applications", "/staff-applications", Briefcase, "umpire referee"),
    action("m-trainers", "Open trainers", "/mtrainers", Dumbbell, "coach"),
    action("m-refs", "Open referee panel", "/mrefree", Shield, "umpire"),
    action("m-social", "Go to social feed", "/msocial", Hash, "posts"),
    action("m-news", "Go to news", "/mnews", Newspaper, "articles"),
    action("m-pay", "Go to payments", "/payments", CreditCard, "money revenue"),
    action("m-coupons", "Manage coupons", "/mcoupons", Tag, "discount promo"),
    action("m-notif", "Open notifications", "/notification", Bell, "alerts"),
    action("m-settings", "Open settings", "/msettings", Settings, "preferences"),
    action("m-chat", "Open group chats", "/group-chat", MessageCircle, "messages"),
  ],
  clubadmin: [
    action("c-dash", "Go to Dashboard", "/club-dashboard", LayoutDashboard, "home overview"),
    action("c-turfs", "Manage turfs", "/turf-management", MapPin, "venues facilities"),
    action("c-staff", "Open staff admin", "/staff-admin", Users, "team employees"),
    action("c-finance", "Open financial overview", "/club-finance", CreditCard, "revenue money"),
    action("c-payments", "Open payment history", "/payment-history", CreditCard, "transactions"),
    action("c-social", "Go to social feed", "/club-social", Hash, "posts"),
    action("c-refs", "Open referee panel", "/club-refree", Shield, "umpire"),
  ],
  superadmin: [
    action("s-home", "Go to dashboard", "/home", Home, "overview"),
    action("s-pending", "Pending users", "/pending", ClipboardCheck, "approvals"),
    action("s-approved", "Approved users", "/approved", Users, "members"),
    action("s-clubs", "Manage clubs", "/manage-clubs", Store, "venues"),
    action("s-create-club", "Create club admin", "/create-club-admin", Building2, "new"),
    action("s-sports", "Sports management", "/sports", Dumbbell, "config"),
    action("s-rules", "Rule books", "/rule-books", BookOpen, "scoring"),
    action("s-rbac", "Roles & permissions", "/rbac", ShieldCheck, "access"),
    action("s-vendors", "Vendor marketplace", "/vendor-marketplace", Store, "products"),
    action("s-news", "News management", "/news", Newspaper, "content"),
    action("s-inquiries", "Inquiries", "/inquiries", BookOpen, "support"),
  ],
  trainer: [
    action("t-dash", "Go to dashboard", "/trainer-dashboard", LayoutDashboard, "home"),
    action("t-sessions", "All sessions", "/trainer-sessions", Calendar, "schedule"),
    action("t-current", "Current session", "/trainer-current", Dumbbell, "now"),
    action("t-upcoming", "Upcoming sessions", "/trainer-upcoming", Calendar, "next"),
    action("t-history", "Session history", "/trainer-history", ClipboardCheck, "past"),
    action("t-requests", "Requests", "/trainer-requests", Bell, "pending"),
    action("t-profile", "Open profile", "/trainer-profile", User, "settings"),
  ],
  corporate_admin: [
    action("co-dash", "Go to dashboard", "/corporate-dashboard", LayoutDashboard, "home"),
    action("co-tour", "Tournaments", "/corporate-tournaments", Trophy, "fixtures"),
    action("co-staff", "Staff management", "/corporate-staff", Users, "employees"),
    action("co-profile", "Company profile", "/corporate-profile", Building2, "settings"),
    action("co-chat", "Group chats", "/group-chat", MessageCircle, "messages"),
  ],
  player: [
    action("p-home", "Go home", "/phome", Home, "dashboard"),
    action("p-tour", "Tournaments", "/ptournament-management", Trophy, "compete"),
    action("p-book", "Book a slot", "/pslot-booking", Calendar, "venue"),
    action("p-trainers", "Find trainers", "/ptrainers", Dumbbell, "coach"),
    action("p-profile", "My profile", "/pprofile", User, "settings"),
    action("p-settings", "Settings", "/psettings", Settings, "preferences"),
  ],
};

export function getActionsForRole(role) {
  const key = (role || "").toLowerCase();
  return ROLE_ACTIONS[key] || ROLE_ACTIONS.manager;
}
