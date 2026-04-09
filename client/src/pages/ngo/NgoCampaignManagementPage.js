import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../services/authService";
import {
  cancelCampaign,
  listMyCampaigns,
} from "../../services/campaignService";
import NGOCampaignShell from "../../components/ngoDashboard/NGOCampaignShell";
import NGOCampaignListPanel from "../../components/ngoDashboard/NGOCampaignListPanel";

const NgoCampaignManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [notice, setNotice] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [cancelingCampaignId, setCancelingCampaignId] = useState("");

  const fetchCampaigns = useCallback(async (filter) => {
    setLoading(true);
    setServerError("");

    try {
      const status = filter === "ALL" ? undefined : filter;
      const data = await listMyCampaigns({ status });
      setCampaigns(Array.isArray(data?.campaigns) ? data.campaigns : []);
    } catch (error) {
      setServerError(getApiErrorMessage(error, "Could not load your campaigns."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns(statusFilter);
  }, [fetchCampaigns, statusFilter]);

  useEffect(() => {
    if (location.state?.message) {
      setNotice(location.state.message);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleCreateCampaign = () => {
    navigate("/ngo/campaigns/create");
  };

  const handleEditCampaign = (campaign) => {
    navigate(`/ngo/campaigns/${campaign._id}/edit`);
  };

  const handleCancelCampaign = async (campaign) => {
    const shouldCancel = window.confirm(
      `Cancel campaign "${campaign.title}"? This performs a soft delete by setting status to Cancelled.`,
    );

    if (!shouldCancel) {
      return;
    }

    setCancelingCampaignId(campaign._id);
    try {
      await cancelCampaign(campaign._id);
      setNotice("Campaign cancelled successfully.");
      await fetchCampaigns(statusFilter);
    } catch (error) {
      setServerError(getApiErrorMessage(error, "Could not cancel campaign."));
    } finally {
      setCancelingCampaignId("");
    }
  };

  return (
    <NGOCampaignShell
      title="Campaign Operations"
      subtitle="Track every campaign your NGO has created, update details quickly, and keep donation efforts organized."
    >
      {notice ? (
        <p className="mb-4 rounded-lg bg-auth-success-bg px-4 py-3 text-sm text-success">{notice}</p>
      ) : null}
      <NGOCampaignListPanel
        campaigns={campaigns}
        loading={loading}
        error={serverError}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onCreateCampaign={handleCreateCampaign}
        onEditCampaign={handleEditCampaign}
        onCancelCampaign={handleCancelCampaign}
        cancelingCampaignId={cancelingCampaignId}
      />
    </NGOCampaignShell>
  );
};

export default NgoCampaignManagementPage;
