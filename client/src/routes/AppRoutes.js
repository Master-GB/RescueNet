// client/src/routes/AppRoutes.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import ShelterPage from "../pages/citizen/ShelterPage";
import DisasterPage from "../pages/citizen/DisasterPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Moving the layout HERE prevents it from bleeding to Auth pages */}
      <Route element={<DashboardLayout />}>
        <Route path="/citizen-dashboard" element={<CitizenDashboard />} />
        <Route path="/citizen/shelters" element={<ShelterPage />} />
        <Route path="/citizen/disaster" element={<DisasterPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;