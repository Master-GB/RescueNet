import { BellRing, ClipboardList, HandHelping, Heart, LayoutDashboard, MapPinned, MessageCircle, UserCircle } from "lucide-react";

export const volunteerSidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/volunteer-dashboard" },
  { name: "My Tasks", icon: ClipboardList, path: "/volunteer/tasks" },
  { name: "Field Map", icon: MapPinned, path: "/volunteer/map" },
  { name: "Team Alerts", icon: BellRing, path: "/volunteer/alerts" },
  { name: "Team Chat", icon: MessageCircle, path: "/volunteer/chat" },
  { name: "Donations", icon: Heart, path: "/volunteer/donations" },
  { name: "Request Help", icon: HandHelping, path: "/volunteer/help-request" },
  { name: "Profile", icon: UserCircle, path: "/volunteer/profile" },
];
