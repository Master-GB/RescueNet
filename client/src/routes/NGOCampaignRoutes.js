import React from "react";
import { Routes, Route } from "react-router-dom";
import RoleRoute from "../components/authentication/RoleRoute";
import NgoCampaignManagementPage from "../pages/ngo/NgoCampaignManagementPage";
import NgoCreateCampaignPage from "../pages/ngo/NgoCreateCampaignPage";
import NgoEditCampaignPage from "../pages/ngo/NgoEditCampaignPage";
import NgoCampaignDonationsPage from "../pages/ngo/NgoCampaignDonationsPage";
import NgoDonationReviewPage from "../pages/ngo/NgoDonationReviewPage";

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
      <Route
        path="/ngo/campaigns/:campaignId/donations"
        element={
          <RoleRoute allowedRoles={["NGO"]} requireFullyOnboarded>
            <NgoCampaignDonationsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/ngo/campaigns/:campaignId/donations/:donationId"
        element={
          <RoleRoute allowedRoles={["NGO"]} requireFullyOnboarded>
            <NgoDonationReviewPage />
          </RoleRoute>
        }
      />
    </Routes>
  );
};

export default NGOCampaignRoutes;
