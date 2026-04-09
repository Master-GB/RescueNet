// client/src/routes/AuthRoutes.js
import React from "react";
import { Routes, Route } from "react-router-dom";

// Guards & Redirects
import GuestRoute from "../components/authentication/GuestRoute";
import OtpVerificationRoute from "../components/authentication/OtpVerificationRoute";
import RoleRoute from "../components/authentication/RoleRoute";
import TrafficCopRedirect from "../components/authentication/TrafficCopRedirect";

// Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import OtpVerificationPage from "../pages/auth/OtpVerificationPage";

// Profile Setup Pages
import CitizenProfileFormPage from "../pages/auth/CitizenProfileFormPage";
import VolunteerProfileFormPage from "../pages/auth/VolunteerProfileFormPage";
import NgoProfileFormPage from "../pages/auth/NgoProfileFormPage";

// Pending Approval Pages
import VolunteerPendingApprovalPage from "../pages/auth/VolunteerPendingApprovalPage";
import NgoPendingApprovalPage from "../pages/auth/NgoPendingApprovalPage";

const AuthRoutes = () => {
  return (
    <Routes>
      {/* Global Fallback/Traffic Cop */}
      <Route path="/" element={<TrafficCopRedirect />} />

      {/* Core Auth */}
      <Route path="/auth/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/auth/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/auth/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/auth/verify-account" element={<OtpVerificationRoute><OtpVerificationPage /></OtpVerificationRoute>} />

      {/* Profile Setup Flows */}
      <Route path="/citizen/profile-setup" element={<RoleRoute allowedRoles={["CITIZEN"]}><CitizenProfileFormPage /></RoleRoute>} />
      <Route path="/volunteer/profile-setup" element={<RoleRoute allowedRoles={["VOLUNTEER"]}><VolunteerProfileFormPage /></RoleRoute>} />
      <Route path="/ngo/profile-setup" element={<RoleRoute allowedRoles={["NGO"]}><NgoProfileFormPage /></RoleRoute>} />

      {/* Pending Approval Notices */}
      <Route path="/volunteer/pending-approval" element={<RoleRoute allowedRoles={["VOLUNTEER"]}><VolunteerPendingApprovalPage /></RoleRoute>} />
      <Route path="/ngo/pending-approval" element={<RoleRoute allowedRoles={["NGO"]}><NgoPendingApprovalPage /></RoleRoute>} />
    </Routes>
  );
};

export default AuthRoutes;