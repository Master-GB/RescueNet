import React from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import VolunteerSectionHeader from "../../components/volunteerDashboard/VolunteerSectionHeader";
import VolunteerTaskBoard from "../../components/volunteerDashboard/VolunteerTaskBoard";
import { volunteerSidebarItems } from "./volunteerLayoutConfig";

const VolunteerTasksPage = () => {
  return (
    <DashboardLayout
      sidebarItems={volunteerSidebarItems}
      portalTitle="Volunteer Portal"
      avatarLetter="V"
      homePath="/volunteer-dashboard"
      searchPlaceholder="Search tasks, locations, and incidents..."
    >
      <div className="space-y-6">
        <VolunteerSectionHeader
          title="My Tasks"
          subtitle="Review and accept pending assignments from current help requests"
        />
        <VolunteerTaskBoard />
      </div>
    </DashboardLayout>
  );
};

export default VolunteerTasksPage;
