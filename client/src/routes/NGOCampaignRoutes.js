import React from "react";
import { Routes, Route } from "react-router-dom";
import RoleRoute from "../components/authentication/RoleRoute";
import NgoCampaignManagementPage from "../pages/ngo/NgoCampaignManagementPage";
import NgoCreateCampaignPage from "../pages/ngo/NgoCreateCampaignPage";
import NgoEditCampaignPage from "../pages/ngo/NgoEditCampaignPage";

const NGOCampaignRoutes = () => {
  return (
    <Routes>
      <Route
        path="/ngo/campaigns"
        element={
          <RoleRoute allowedRoles={["NGO"]} requireFullyOnboarded>
            <NgoCampaignManagementPage />
          </RoleRoute>
        }
      />
      <Route
        path="/ngo/campaigns/create"
        element={
          <RoleRoute allowedRoles={["NGO"]} requireFullyOnboarded>
            <NgoCreateCampaignPage />
          </RoleRoute>
        }
      />
      <Route
        path="/ngo/campaigns/:campaignId/edit"
        element={
          <RoleRoute allowedRoles={["NGO"]} requireFullyOnboarded>
            <NgoEditCampaignPage />
          </RoleRoute>
        }
      />
    </Routes>
  );
};

export default NGOCampaignRoutes;
