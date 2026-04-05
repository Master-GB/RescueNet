import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import CitizenHelpRequest from "../pages/citizen/CitizenHelpRequest";
import VolunteerDashboard from "../pages/volunteer/VolunteerDashboard";
import NgoDashboard from "../pages/ngo/NgoDashboard";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CitizenDashboard />} />
        <Route path="/citizen/help-request" element={<CitizenHelpRequest />} />
        <Route path="/volunteer" element={<VolunteerDashboard />} />
        <Route path="/ngo" element={<NgoDashboard />} />
        <Route path="/ngo/dashboard" element={<NgoDashboard />} />
      </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;