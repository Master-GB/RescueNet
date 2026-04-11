import { ClipboardList, LayoutDashboard, Megaphone, Home, UserCircle } from "lucide-react";

const ngoSidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/ngo-dashboard" },
  { name: "Task Management", icon: ClipboardList, path: "/ngo/tasks" },
  { name: "Donation Campaigns", icon: Megaphone, path: "/ngo/campaigns" },
  { name: "Shelters", icon: Home, path: "/ngo/shelters" },
  { name: "Profile", icon: UserCircle, path: "/ngo/profile" },
];

export default ngoSidebarItems;
