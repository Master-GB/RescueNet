// client/src/routes/VolunteerRoutes.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RoleRoute from "../components/authentication/RoleRoute";
import VolunteerDashboard from "../pages/volunteer/VolunteerDashboard";

const VolunteerRoutes = () => {
  return (
    <Routes>
      {/* Quick redirect from base to dashboard */}
      <Route path="/volunteer" element={<Navigate to="/volunteer-dashboard" replace />} />

      {/* Main Dashboard */}
      <Route
        path="/volunteer-dashboard"
        element={
          <RoleRoute allowedRoles={["VOLUNTEER"]} requireFullyOnboarded>
            <VolunteerDashboard />
          </RoleRoute>
        }
      />
    </Routes>
  );
};

export default VolunteerRoutes;