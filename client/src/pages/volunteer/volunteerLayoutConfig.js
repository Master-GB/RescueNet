import { BellRing, ClipboardList, HandHelping, LayoutDashboard, MapPinned, UserCircle } from "lucide-react";

export const volunteerSidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/volunteer-dashboard" },
  { name: "My Tasks", icon: ClipboardList, path: "/volunteer/tasks" },
  { name: "Field Map", icon: MapPinned, path: "/volunteer/map" },
  { name: "Team Alerts", icon: BellRing, path: "/volunteer/alerts" },
  { name: "Relief Requests", icon: HandHelping, path: "/volunteer/requests" },
  { name: "Profile", icon: UserCircle, path: "/volunteer/profile" },
];
