import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import GuestRoute from "../components/authentication/GuestRoute";
import OtpVerificationRoute from "../components/authentication/OtpVerificationRoute";
import RoleRoute from "../components/authentication/RoleRoute";
import TrafficCopRedirect from "../components/authentication/TrafficCopRedirect";
import AdminDashboard from "../pages/admin/AdminDashboard";
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
import ShelterPage from "../pages/citizen/ShelterPage";
import DisasterPage from "../pages/citizen/DisasterPage";
import MissingPersonPage from "../pages/citizen/MissingPersonPage";
import CitizenHelpRequest from "../pages/citizen/CitizenHelpRequest";
import NgoDashboard from "../pages/ngo/NgoDashboard";
import VolunteerDashboard from "../pages/volunteer/VolunteerDashboard";
import DashboardLayout from "../layouts/DashboardLayout";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<TrafficCopRedirect />} />

      <Route path="/volunteer" element={<Navigate to="/volunteer-dashboard" replace />} />

      <Route
        path="/auth/login"
        element={(
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        )}
      />
      <Route
        path="/auth/register"
        element={(
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        )}
      />
      <Route
        path="/auth/forgot-password"
        element={(
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        )}
      />
      <Route
        path="/auth/verify-account"
        element={(
          <OtpVerificationRoute>
            <OtpVerificationPage />
          </OtpVerificationRoute>
        )}
      />

      <Route
        path="/citizen/profile-setup"
        element={(
          <RoleRoute allowedRoles={["CITIZEN"]}>
            <CitizenProfileFormPage />
          </RoleRoute>
        )}
      />
      <Route
        path="/volunteer/profile-setup"
        element={(
          <RoleRoute allowedRoles={["VOLUNTEER"]}>
            <VolunteerProfileFormPage />
          </RoleRoute>
        )}
      />
      <Route
        path="/ngo/profile-setup"
        element={(
          <RoleRoute allowedRoles={["NGO"]}>
            <NgoProfileFormPage />
          </RoleRoute>
        )}
      />
      <Route
        path="/volunteer/pending-approval"
        element={(
          <RoleRoute allowedRoles={["VOLUNTEER"]}>
            <VolunteerPendingApprovalPage />
          </RoleRoute>
        )}
      />
      <Route
        path="/ngo/pending-approval"
        element={(
          <RoleRoute allowedRoles={["NGO"]}>
            <NgoPendingApprovalPage />
          </RoleRoute>
        )}
      />

      <Route
        path="/citizen-dashboard"
        element={(
          <RoleRoute allowedRoles={["CITIZEN"]} requireFullyOnboarded>
            <CitizenDashboard />
          </RoleRoute>
        )}
      />
       <Route
        path="/citizen/missing-persons"
        element={(
          <RoleRoute allowedRoles={["CITIZEN"]} requireFullyOnboarded>
            <MissingPersonPage />
          </RoleRoute>
        )}
      />
       <Route
        path="/citizen/disaster"
        element={(
          <RoleRoute allowedRoles={["CITIZEN"]} requireFullyOnboarded>
            <DisasterPage />
          </RoleRoute>
        )}
      />
      <Route
        path="/citizen/shelters"
        element={(
          <RoleRoute allowedRoles={["CITIZEN"]} requireFullyOnboarded>
            <DashboardLayout>
              <ShelterPage />
            </DashboardLayout>
            
          </RoleRoute>
        )}
      />
      <Route
        path="/volunteer-dashboard"
        element={(
          <RoleRoute allowedRoles={["VOLUNTEER"]} requireFullyOnboarded>
            <VolunteerDashboard />
          </RoleRoute>
        )}
      />
      <Route
        path="/ngo-dashboard"
        element={(
          <RoleRoute allowedRoles={["NGO"]} requireFullyOnboarded>
            <NgoDashboard />
          </RoleRoute>
        )}
      />
      <Route
        path="/admin-dashboard"
        element={(
          <RoleRoute allowedRoles={["ADMIN"]} requireFullyOnboarded>
            <AdminDashboard />
          </RoleRoute>
        )}
      />

      <Route
        path="/citizen/help-request"
        element={(
          <RoleRoute allowedRoles={["CITIZEN"]} requireFullyOnboarded>
            <CitizenHelpRequest />
          </RoleRoute>
        )}
      />

      <Route path="*" element={<TrafficCopRedirect />} />
    </Routes>
  );
};

export default AppRoutes;