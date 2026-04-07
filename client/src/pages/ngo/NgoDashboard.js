import React from "react";
import { LayoutDashboard, Landmark } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";

const ngoSidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/ngo-dashboard" },
];

export default function NgoDashboard() {
  return (
    <DashboardLayout
      sidebarItems={ngoSidebarItems}
      portalTitle="NGO Portal"
      avatarLetter="N"
      homePath="/ngo-dashboard"
      searchPlaceholder="Search assigned requests, districts, and resources..."
    >
      <section className="rounded-2xl bg-surface-container-low p-6 ghost-outline">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary px-3 py-2 text-on-primary">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">NGO Operations Dashboard</h1>
            <p className="mt-2 text-sm text-on-surface/80">
              This is the initial NGO dashboard shell. It is now available for approved NGO profiles after auth and verification gates.
            </p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
