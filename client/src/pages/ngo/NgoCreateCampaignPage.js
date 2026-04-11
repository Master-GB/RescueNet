import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../services/authService";
import { createCampaign } from "../../services/campaignService";
import NGOCampaignShell from "../../components/ngoDashboard/NGOCampaignShell";
import NGOCampaignForm from "../../components/ngoDashboard/NGOCampaignForm";

const NgoCreateCampaignPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setServerError("");

    try {
      await createCampaign(payload);
      navigate("/ngo/campaigns", {
        replace: true,
        state: { message: "Campaign created successfully." },
      });
    } catch (error) {
      setServerError(getApiErrorMessage(error, "Could not create campaign."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <NGOCampaignShell
      title="Create Campaign"
      subtitle="Define campaign details, bank transfer instructions, accepted supply items, and optionally upload a campaign image for donors."
    >
      <NGOCampaignForm
        mode="create"
        submitting={submitting}
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/ngo/campaigns")}
      />
    </NGOCampaignShell>
  );
};

export default NgoCreateCampaignPage;
