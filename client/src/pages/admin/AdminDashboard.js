import React from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import adminSidebarItems from "./adminSidebarItems";

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
            <Link
              to="/admin/tasks"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
            >
              Open Task Management
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
