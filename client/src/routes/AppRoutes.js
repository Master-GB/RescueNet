import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import ShelterPage from "../pages/citizen/ShelterPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<CitizenDashboard />} />
          <Route path="/citizen/shelters" element={<ShelterPage />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
};

export default AppRoutes;