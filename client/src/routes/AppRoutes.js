import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import CitizenHelpRequest from "../pages/citizen/CitizenHelpRequest";
import VolunteerDashboard from "../pages/volunteer/VolunteerDashboard";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CitizenDashboard />} />
        <Route path="/citizen/help-request" element={<CitizenHelpRequest />} />
        <Route path="/volunteer" element={<VolunteerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;