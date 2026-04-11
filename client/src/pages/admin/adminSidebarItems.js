import { Building2, ClipboardList, LayoutDashboard } from "lucide-react";

const adminSidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin-dashboard" },
  { name: "Task Management", icon: ClipboardList, path: "/admin/tasks" },
  { name: "NGO Management", icon: Building2, path: "/admin/ngos" },
];

export default adminSidebarItems;
