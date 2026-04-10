import React from "react";
import { LayoutDashboard, ShieldCheck,Home } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";

const adminSidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin-dashboard" },
  { name: "Shelter Management", icon: Home, path: "/admin/shelter-management" },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout
      sidebarItems={adminSidebarItems}
      portalTitle="Admin Portal"
      avatarLetter="A"
      homePath="/admin-dashboard"
      searchPlaceholder="Search users, approvals, and platform controls..."
    >
      <section className="rounded-2xl bg-surface-container-low p-6 ghost-outline">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary px-3 py-2 text-on-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Admin Command Dashboard</h1>
            <p className="mt-2 text-sm text-on-surface/80">
              This is the initial admin dashboard shell and now serves as the authenticated destination for ADMIN users.
            </p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
