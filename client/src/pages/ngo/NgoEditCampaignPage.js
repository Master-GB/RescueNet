import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../services/authService";
import { getCampaignById, updateCampaign } from "../../services/campaignService";
import NGOCampaignShell from "../../components/ngoDashboard/NGOCampaignShell";
import NGOCampaignForm from "../../components/ngoDashboard/NGOCampaignForm";

const NgoEditCampaignPage = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCampaign = async () => {
      setLoading(true);
      setServerError("");

      try {
        const data = await getCampaignById(campaignId);
        if (!isMounted) {
          return;
        }

        setCampaign(data?.campaign || null);
      } catch (error) {
        if (isMounted) {
          setServerError(getApiErrorMessage(error, "Could not load campaign details."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCampaign();

    return () => {
      isMounted = false;
    };
  }, [campaignId]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setServerError("");

    try {
      await updateCampaign(campaignId, payload);
      navigate("/ngo/campaigns", {
        replace: true,
        state: { message: "Campaign updated successfully." },
      });
    } catch (error) {
      setServerError(getApiErrorMessage(error, "Could not update campaign."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <NGOCampaignShell
      title="Update Campaign"
      subtitle="Refine messaging, target values, bank details, accepted items, and campaign status in one place."
    >
      {loading ? (
        <section className="rounded-2xl bg-surface-container-high p-8 shadow-ambient">
          <p className="text-sm text-secondary">Loading campaign details...</p>
        </section>
      ) : campaign ? (
        <NGOCampaignForm
          mode="edit"
          initialValues={campaign}
          submitting={submitting}
          serverError={serverError}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/ngo/campaigns")}
        />
      ) : (
        <section className="rounded-2xl bg-surface-container-high p-8 shadow-ambient">
          <p className="text-sm text-danger">{serverError || "Campaign not found."}</p>
          <button
            type="button"
            onClick={() => navigate("/ngo/campaigns")}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container"
          >
            Back to campaigns
          </button>
        </section>
      )}
    </NGOCampaignShell>
  );
};

export default NgoEditCampaignPage;
