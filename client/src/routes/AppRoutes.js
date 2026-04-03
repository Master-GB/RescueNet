import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import VolunteerDashboard from "../pages/volunteer/VolunteerDashboard";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CitizenDashboard />} />
        <Route path="/volunteer" element={<VolunteerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;