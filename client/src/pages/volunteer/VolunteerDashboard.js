import React from "react";
import { LayoutDashboard, ClipboardList, MapPinned, BellRing,Home, UserCircle, HandHelping, Siren } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import VolunteerGreeting from "../../components/volunteerDashboard/VolunteerGreeting";
import VolunteerSectionHeader from "../../components/volunteerDashboard/VolunteerSectionHeader";
import VolunteerBriefingBanner from "../../components/volunteerDashboard/VolunteerBriefingBanner";
import VolunteerFieldConditions from "../../components/volunteerDashboard/VolunteerFieldConditions";
import VolunteerStatsGrid from "../../components/volunteerDashboard/VolunteerStatsGrid";
import VolunteerActionCenter from "../../components/volunteerDashboard/VolunteerActionCenter";
import VolunteerTaskBoard from "../../components/volunteerDashboard/VolunteerTaskBoard";
import VolunteerActivityFeed from "../../components/volunteerDashboard/VolunteerActivityFeed";

import { volunteerSidebarItems } from "./volunteerLayoutConfig";

const VolunteerDashboard = () => {
  return (
    <DashboardLayout
      sidebarItems={volunteerSidebarItems}
      portalTitle="Volunteer Portal"
      avatarLetter="V"
      homePath="/volunteer-dashboard"
      searchPlaceholder="Search tasks, shelters, volunteer teams..."
    >
      <div className="space-y-8">
        <VolunteerGreeting />

        <VolunteerBriefingBanner />

        <section>
          <VolunteerSectionHeader
            title="Volunteer Command Overview"
            subtitle="Live operational visibility for active responders and relief assignments"
          />
          <VolunteerStatsGrid />
        </section>

        <VolunteerFieldConditions />

        <section>
          <VolunteerSectionHeader
            title="Action Center"
            subtitle="Fast command tools for dispatch, routing, verification, and supply updates"
          />
          <VolunteerActionCenter />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <VolunteerSectionHeader
              title="Assigned Response Tasks"
              subtitle="Prioritized assignments waiting for volunteer confirmation"
            />
            <VolunteerTaskBoard />
          </div>

          <div>
            <VolunteerSectionHeader
              title="Coordination Feed"
              subtitle="Recent updates from dispatch and field teams"
            />
            <VolunteerActivityFeed />
          </div>
        </section>

        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
              <Siren className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-red-800">Emergency Broadcast Channel</h3>
              <p className="text-sm text-red-700 mt-1">
                Keep your communication device online. The next district-wide volunteer mobilization update is expected in 12 minutes.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;
