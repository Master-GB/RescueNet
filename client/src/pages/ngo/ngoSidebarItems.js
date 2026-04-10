import { ClipboardList, LayoutDashboard, Megaphone } from "lucide-react";

const ngoSidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/ngo-dashboard" },
  { name: "Task Management", icon: ClipboardList, path: "/ngo/tasks" },
  { name: "Donation Campaigns", icon: Megaphone, path: "/ngo/campaigns" },
];

export default ngoSidebarItems;
