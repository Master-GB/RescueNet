import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NGOCampaignShell from "../../components/ngoDashboard/NGOCampaignShell";
import { getApiErrorMessage } from "../../services/authService";
import {
  getCampaignById,
  updateCampaignStatus,
} from "../../services/campaignService";
import { listCampaignDonations } from "../../services/donationService";

const donationStatusTone = {
  Pending: "bg-warning text-black",
  Verified: "bg-success text-black",
  Rejected: "bg-danger text-on-primary",
};

const campaignStatusTone = {
  Active: "bg-primary-container text-on-primary",
  Completed: "bg-secondary-container text-on-surface",
  Cancelled: "bg-surface-container text-secondary",
};

const toLkr = (value = 0) => {
  const number = Number(value) || 0;
  return number.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const NgoCampaignDonationsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { campaignId } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [notice, setNotice] = useState("");
  const [completing, setCompleting] = useState(false);

  const progress = useMemo(() => {
    const targetAmount = Number(campaign?.targetAmount) || 0;
    const raisedAmount = Number(campaign?.raisedAmount) || 0;

    if (targetAmount <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((raisedAmount / targetAmount) * 100));
  }, [campaign?.raisedAmount, campaign?.targetAmount]);

  const loadCampaign = useCallback(async () => {
    setCampaignLoading(true);

    try {
      const data = await getCampaignById(campaignId);
      setCampaign(data?.campaign || null);
    } catch (error) {
      console.error("Could not load campaign details:", error);
      setServerError(getApiErrorMessage(error, "Could not load campaign details."));
    } finally {
      setCampaignLoading(false);
    }
  }, [campaignId]);

  const loadDonations = useCallback(
    async (filter) => {
      setDonationsLoading(true);

      try {
        const status = filter === "ALL" ? undefined : filter;
        const data = await listCampaignDonations(campaignId, { status });
        setDonations(Array.isArray(data?.donations) ? data.donations : []);
      } catch (error) {
        console.error("Could not load campaign donations:", error);
        setServerError(getApiErrorMessage(error, "Could not load campaign donations."));
      } finally {
        setDonationsLoading(false);
      }
    },
    [campaignId],
  );

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  useEffect(() => {
    loadDonations(statusFilter);
  }, [loadDonations, statusFilter]);

  useEffect(() => {
    if (location.state?.message) {
      setNotice(location.state.message);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleOpenDonation = (donation) => {
    navigate(`/ngo/campaigns/${campaignId}/donations/${donation._id}`);
  };

  const handleMarkCompleted = async () => {
    if (!campaign || campaign.status !== "Active") {
      return;
    }

    const shouldComplete = window.confirm(
      `Mark campaign "${campaign.title}" as Completed? Donors will not be able to submit new donations after completion.`,
    );

    if (!shouldComplete) {
      return;
    }

    setCompleting(true);
    setServerError("");

    try {
      const data = await updateCampaignStatus(campaignId, "Completed");
      setCampaign(data?.campaign || campaign);
      setNotice("Campaign marked as Completed.");
    } catch (error) {
      console.error("Could not complete campaign:", error);
      setServerError(getApiErrorMessage(error, "Could not update campaign status."));
    } finally {
      setCompleting(false);
    }
  };

  return (
    <NGOCampaignShell
      title="Campaign Donations"
      subtitle="Review all donations for this campaign, verify proof images, and keep campaign progress up to date."
      actions={
        <>
          <button
            type="button"
            onClick={() => navigate("/ngo/campaigns")}
            className="rounded-lg bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-bright"
          >
            Back to campaigns
          </button>
          <button
            type="button"
            onClick={() => loadDonations(statusFilter)}
            className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container"
          >
            Refresh list
          </button>
        </>
      }
    >
      {notice ? (
        <p className="mb-4 rounded-lg bg-auth-success-bg px-4 py-3 text-sm text-success">{notice}</p>
      ) : null}

      {serverError ? (
        <p className="mb-4 rounded-lg bg-auth-danger-bg px-4 py-3 text-sm text-danger">{serverError}</p>
      ) : null}

      {campaignLoading ? (
        <section className="rounded-2xl bg-surface-container-high p-8 shadow-ambient">
          <p className="text-sm text-secondary">Loading campaign details...</p>
        </section>
      ) : campaign ? (
        <section className="space-y-5">
          <article className="rounded-2xl bg-surface-container-low p-5 shadow-ambient">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-[-0.01em] text-on-surface">{campaign.title}</h2>
                <p className="text-sm text-secondary">{campaign.description}</p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${campaignStatusTone[campaign.status] || campaignStatusTone.Active}`}
                >
                  {campaign.status || "Active"}
                </span>
              </div>

              <button
                type="button"
                disabled={campaign.status !== "Active" || completing}
                onClick={handleMarkCompleted}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
              >
                {completing ? "Updating..." : "Mark completed"}
              </button>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
                <span>Raised</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-container">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-secondary">
                LKR {toLkr(campaign.raisedAmount)} / {toLkr(campaign.targetAmount)}
              </p>
            </div>
          </article>

          <article className="rounded-2xl bg-surface-container-low p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Donations</h3>
                <p className="text-xs text-secondary">Review each donation and verify or reject with confidence.</p>
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg bg-surface-container-high px-3 py-2 text-sm text-on-surface outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
                <option value="ALL">All statuses</option>
              </select>
            </div>
          </article>

          {donationsLoading ? (
            <article className="rounded-2xl bg-surface-container-high p-8 shadow-ambient">
              <p className="text-sm text-secondary">Loading donations...</p>
            </article>
          ) : donations.length === 0 ? (
            <article className="rounded-2xl bg-surface-container-high p-8 shadow-ambient">
              <h3 className="text-xl font-bold tracking-[-0.01em] text-on-surface">No donations for this filter</h3>
              <p className="mt-2 text-sm text-secondary">Switch filters or check back soon as citizens and volunteers submit new donations.</p>
            </article>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {donations.map((donation) => {
                const donorName = donation?.donorId?.name || "Unknown donor";
                const donorEmail = donation?.donorId?.email || "No email available";

                return (
                  <article
                    key={donation._id}
                    className="rounded-2xl bg-surface-container-high p-5 shadow-ambient"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Donor</p>
                        <h4 className="text-lg font-bold text-on-surface">{donorName}</h4>
                        <p className="text-xs text-secondary">{donorEmail}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${donationStatusTone[donation.status] || donationStatusTone.Pending}`}
                      >
                        {donation.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-secondary">
                      <p>
                        <span className="font-semibold text-on-surface">Type:</span> {donation.donationType}
                      </p>
                      <p>
                        <span className="font-semibold text-on-surface">Declared amount:</span> LKR {toLkr(donation.declaredAmount)}
                      </p>
                      <p>
                        <span className="font-semibold text-on-surface">Submitted:</span> {formatDate(donation.createdAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenDonation(donation)}
                      className="mt-5 w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary transition hover:bg-primary-container"
                    >
                      View donation
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-2xl bg-surface-container-high p-8 shadow-ambient">
          <p className="text-sm text-danger">Campaign could not be found.</p>
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

export default NgoCampaignDonationsPage;
