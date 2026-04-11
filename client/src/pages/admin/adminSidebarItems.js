import { ClipboardList, LayoutDashboard,Home,BellRing , Building2} from "lucide-react";

const adminSidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin-dashboard" },
   { name: "Shelter Management", icon: Home, path: "/admin/shelter-management" },
  { name: "Task Management", icon: ClipboardList, path: "/admin/tasks" },
  { name: "Area Situations", icon: BellRing, path: "/admin/area-situations" },
  { name: "NGO Management", icon: Building2, path: "/admin/ngos" },
];

export default adminSidebarItems;
