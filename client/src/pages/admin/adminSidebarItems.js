import { ClipboardList, LayoutDashboard,Home,BellRing } from "lucide-react";

const adminSidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin-dashboard" },
   { name: "Shelter Management", icon: Home, path: "/admin/shelter-management" },
  { name: "Task Management", icon: ClipboardList, path: "/admin/tasks" },
  { name: "Area Situations", icon: BellRing, path: "/admin/area-situations" },
];

export default adminSidebarItems;
