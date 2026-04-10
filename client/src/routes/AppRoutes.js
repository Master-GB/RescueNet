import React from "react";
import { LayoutDashboard, ShieldCheck, Home } from "lucide-react";
import { Navigate, Route, Routes } from "react-router-dom";
import GuestRoute from "../components/authentication/GuestRoute";
import OtpVerificationRoute from "../components/authentication/OtpVerificationRoute";
import RoleRoute from "../components/authentication/RoleRoute";
import TrafficCopRedirect from "../components/authentication/TrafficCopRedirect";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminNgoManagementPage from "../pages/admin/AdminNgoManagementPage";
import AdminTaskDetailPage from "../pages/admin/AdminTaskDetailPage";
import AdminTaskManagementPage from "../pages/admin/AdminTaskManagementPage";
import CitizenProfileFormPage from "../pages/auth/CitizenProfileFormPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import LoginPage from "../pages/auth/LoginPage";
import NgoPendingApprovalPage from "../pages/auth/NgoPendingApprovalPage";
import NgoProfileFormPage from "../pages/auth/NgoProfileFormPage";
import OtpVerificationPage from "../pages/auth/OtpVerificationPage";
import RegisterPage from "../pages/auth/RegisterPage";
import VolunteerPendingApprovalPage from "../pages/auth/VolunteerPendingApprovalPage";
import VolunteerProfileFormPage from "../pages/auth/VolunteerProfileFormPage";
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import CitizenProfilePage from "../pages/citizen/CitizenProfilePage";
import EmergencyContactPage from "../pages/citizen/EmergencyContactPage";
import ShelterPage from "../pages/citizen/ShelterPage";
import DisasterPage from "../pages/citizen/DisasterPage";
import MissingPersonPage from "../pages/citizen/MissingPersonPage";
import CitizenHelpRequest from "../pages/citizen/CitizenHelpRequest";
import CitizenDonationsPage from "../pages/citizen/CitizenDonationsPage";
import DonationDetailsPage from "../pages/citizen/DonationDetailsPage";
import NgoDashboard from "../pages/ngo/NgoDashboard";
import NgoCampaignManagementPage from "../pages/ngo/NgoCampaignManagementPage";
import NgoCreateCampaignPage from "../pages/ngo/NgoCreateCampaignPage";
import NgoEditCampaignPage from "../pages/ngo/NgoEditCampaignPage";
import NgoCampaignDonationsPage from "../pages/ngo/NgoCampaignDonationsPage";
import NgoDonationReviewPage from "../pages/ngo/NgoDonationReviewPage";
import NgoTaskManagementPage from "../pages/ngo/NgoTaskManagementPage";
import VolunteerDashboard from "../pages/volunteer/VolunteerDashboard";
import DashboardLayout from "../layouts/DashboardLayout";
import FirstAidGuidePage from "../pages/citizen/FirstAidGuidePage";
import ShelterManagement from "../pages/admin/ShelterManagement";
import VerifyShelter from "../pages/admin/VerifyShelter";
import ShelterManagementNGO from "../pages/ngo/ShelterManagementNGO";

const adminSidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin-dashboard" },
  { name: "Shelter Management", icon: Home, path: "/admin/shelter-management" },
];

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<TrafficCopRedirect />} />

      <Route
        path="/volunteer"
        element={<Navigate to="/volunteer-dashboard" replace />}
      />

      <Route
        path="/auth/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/auth/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route
        path="/auth/forgot-password"
        element={
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        }
      />
      <Route
        path="/auth/verify-account"
        element={
          <OtpVerificationRoute>
            <OtpVerificationPage />
          </OtpVerificationRoute>
        }
      />

      <Route
        path="/citizen/profile-setup"
        element={
          <RoleRoute allowedRoles={["CITIZEN"]}>
            <CitizenProfileFormPage />
          </RoleRoute>
        }
      />
      <Route
        path="/volunteer/profile-setup"
        element={
          <RoleRoute allowedRoles={["VOLUNTEER"]}>
            <VolunteerProfileFormPage />
          </RoleRoute>
        }
      />
      <Route
        path="/ngo/profile-setup"
        element={
          <RoleRoute allowedRoles={["NGO"]}>
            <NgoProfileFormPage />
          </RoleRoute>
        }
      />
      <Route
        path="/volunteer/pending-approval"
        element={
          <RoleRoute allowedRoles={["VOLUNTEER"]}>
            <VolunteerPendingApprovalPage />
          </RoleRoute>
        }
      />
      <Route
        path="/ngo/pending-approval"
        element={
          <RoleRoute allowedRoles={["NGO"]}>
            <NgoPendingApprovalPage />
          </RoleRoute>
        }
      />

      <Route
        path="/citizen-dashboard"
        element={
          <RoleRoute allowedRoles={["CITIZEN"]} requireFullyOnboarded>
            <CitizenDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/citizen/first-aid-guide"
        element={
          <RoleRoute allowedRoles={["CITIZEN"]} requireFullyOnboarded>
            <DashboardLayout>
              <FirstAidGuidePage />
            </DashboardLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/citizen/profile"
        element={
          <RoleRoute allowedRoles={["CITIZEN"]} requireFullyOnboarded>
            <DashboardLayout>
              <CitizenProfilePage />
            </DashboardLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/citizen/emergency-contact"
        element={
          <RoleRoute allowedRoles={["CITIZEN"]} requireFullyOnboarded>
            <DashboardLayout>
              <EmergencyContactPage />
            </DashboardLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/citizen/missing-persons"
        element={
          <RoleRoute allowedRoles={["CITIZEN"]} requireFullyOnboarded>
            <MissingPersonPage />
          </RoleRoute>
        }
      />
      <Route
        path="/citizen/disaster"
        element={
          <RoleRoute allowedRoles={["CITIZEN"]} requireFullyOnboarded>
            <DisasterPage />
          </RoleRoute>
        }
      />
      <Route
        path="/citizen/shelters"
        element={
          <RoleRoute allowedRoles={["CITIZEN"]} requireFullyOnboarded>
            <DashboardLayout>
              <ShelterPage />
            </DashboardLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/donations"
        element={(
          <RoleRoute allowedRoles={["CITIZEN"]} requireFullyOnboarded>
            <DashboardLayout>
              <CitizenDonationsPage />
            </DashboardLayout>
          </RoleRoute>
        )}
      />
      <Route
        path="/donations/:id"
        element={(
          <RoleRoute allowedRoles={["CITIZEN"]} requireFullyOnboarded>
            <DashboardLayout>
              <DonationDetailsPage />
            </DashboardLayout>
          </RoleRoute>
        )}
      />
      <Route
        path="/volunteer-dashboard"
        element={
          <RoleRoute allowedRoles={["VOLUNTEER"]} requireFullyOnboarded>
            <VolunteerDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/ngo-dashboard"
        element={
          <RoleRoute allowedRoles={["NGO"]} requireFullyOnboarded>
            <NgoDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/ngo/tasks"
        element={(
          <RoleRoute allowedRoles={["NGO"]} requireFullyOnboarded>
            <NgoTaskManagementPage />
          </RoleRoute>
        )}
      />
      <Route
        path="/ngo/campaigns"
        element={(
          <RoleRoute allowedRoles={["NGO"]} requireFullyOnboarded>
            <NgoCampaignManagementPage />
          </RoleRoute>
        )}
      />
      <Route
        path="/ngo/campaigns/create"
        element={(
          <RoleRoute allowedRoles={["NGO"]} requireFullyOnboarded>
            <NgoCreateCampaignPage />
          </RoleRoute>
        )}
      />
      <Route
        path="/ngo/campaigns/:campaignId/edit"
        element={(
          <RoleRoute allowedRoles={["NGO"]} requireFullyOnboarded>
            <NgoEditCampaignPage />
          </RoleRoute>
        )}
      />
      <Route
        path="/ngo/campaigns/:campaignId/donations"
        element={(
          <RoleRoute allowedRoles={["NGO"]} requireFullyOnboarded>
            <NgoCampaignDonationsPage />
          </RoleRoute>
        )}
      />
      <Route
        path="/ngo/campaigns/:campaignId/donations/:donationId"
        element={(
          <RoleRoute allowedRoles={["NGO"]} requireFullyOnboarded>
            <NgoDonationReviewPage />
          </RoleRoute>
        )}
      />
      <Route
        path="/admin-dashboard"
        element={
          <RoleRoute allowedRoles={["ADMIN"]} requireFullyOnboarded>
            <AdminDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/admin/shelter-management"
        element={
          <RoleRoute allowedRoles={["ADMIN"]} requireFullyOnboarded>
            <DashboardLayout
              sidebarItems={adminSidebarItems}
              portalTitle="Admin Portal"
              avatarLetter="A"
              homePath="/admin-dashboard"
              searchPlaceholder="Search users, approvals, and platform controls..."
            >
              <ShelterManagement />
            </DashboardLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/admin/shelters"
        element={
          <RoleRoute allowedRoles={["ADMIN"]} requireFullyOnboarded>
            <DashboardLayout
              sidebarItems={adminSidebarItems}
              portalTitle="Admin Portal"
              avatarLetter="A"
              homePath="/admin-dashboard"
              searchPlaceholder="Search users, approvals, and platform controls..."
            >
              <ShelterManagementNGO />
            </DashboardLayout>
          </RoleRoute>
        }
      />

      <Route
        path="/admin/verify-shelters"
        element={
          <RoleRoute allowedRoles={["ADMIN"]} requireFullyOnboarded>
            <DashboardLayout
              sidebarItems={adminSidebarItems}
              portalTitle="Admin Portal"
              avatarLetter="A"
              homePath="/admin-dashboard"
              searchPlaceholder="Search users, approvals, and platform controls..."
            >
              <VerifyShelter />
            </DashboardLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/admin/ngos"
        element={(
          <RoleRoute allowedRoles={["ADMIN"]} requireFullyOnboarded>
            <AdminNgoManagementPage />
          </RoleRoute>
        )}
      />
      <Route
        path="/admin/tasks"
        element={(
          <RoleRoute allowedRoles={["ADMIN"]} requireFullyOnboarded>
            <AdminTaskManagementPage />
          </RoleRoute>
        )}
      />
      <Route
        path="/admin/tasks/:taskId"
        element={(
          <RoleRoute allowedRoles={["ADMIN"]} requireFullyOnboarded>
            <AdminTaskDetailPage />
          </RoleRoute>
        )}
      />

      <Route
        path="/citizen/help-request"
        element={
          <RoleRoute allowedRoles={["CITIZEN"]} requireFullyOnboarded>
            <CitizenHelpRequest />
          </RoleRoute>
        }
      />

      <Route path="*" element={<TrafficCopRedirect />} />
    </Routes>
  );
};

export default AppRoutes;
