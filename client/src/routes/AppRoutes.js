import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CitizenDashboard from "../pages/citizen/CitizenDashboard";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CitizenDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;