import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NGOCampaignShell from "../../components/ngoDashboard/NGOCampaignShell";
import { getApiErrorMessage } from "../../services/authService";
import {
  getCampaignById,
  updateCampaignStatus,
} from "../../services/campaignService";
import {
  getDonationById,
  verifyDonationByNgo,
} from "../../services/donationService";

const statusTone = {
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

const NgoDonationReviewPage = () => {
  const navigate = useNavigate();
  const { campaignId, donationId } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmedAmount, setConfirmedAmount] = useState("");

  const progress = useMemo(() => {
    const targetAmount = Number(campaign?.targetAmount) || 0;
    const raisedAmount = Number(campaign?.raisedAmount) || 0;

    if (targetAmount <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((raisedAmount / targetAmount) * 100));
  }, [campaign?.raisedAmount, campaign?.targetAmount]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setServerError("");

    try {
      const [campaignData, donationData] = await Promise.all([
        getCampaignById(campaignId),
        getDonationById(donationId),
      ]);

      const loadedCampaign = campaignData?.campaign || null;
      const loadedDonation = donationData?.donation || null;

      if (!loadedCampaign || !loadedDonation) {
        setServerError("Could not load donation details.");
        return;
      }

      if (String(loadedDonation.campaignId) !== String(campaignId)) {
        setServerError("Donation does not belong to the selected campaign.");
        return;
      }

      setCampaign(loadedCampaign);
      setDonation(loadedDonation);

      const defaultAmount = Number(loadedDonation.declaredAmount) || 0;
      setConfirmedAmount(defaultAmount > 0 ? String(defaultAmount) : "");
    } catch (error) {
      console.error("Could not load donation review data:", error);
      setServerError(getApiErrorMessage(error, "Could not load donation details."));
    } finally {
      setLoading(false);
    }
  }, [campaignId, donationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReview = async (nextStatus) => {
    if (!donation || donation.status !== "Pending") {
      return;
    }

    setSubmitting(true);
    setServerError("");
    setNotice("");

    const previousRaisedAmount = Number(campaign?.raisedAmount) || 0;
    const targetAmount = Number(campaign?.targetAmount) || 0;
    const previousCampaignStatus = campaign?.status || "Active";

    let amountToSend = 0;

    if (nextStatus === "Verified") {
      amountToSend = Number(confirmedAmount);
      if (!Number.isFinite(amountToSend) || amountToSend <= 0) {
        setServerError("Please provide a valid confirmed amount greater than zero before verifying.");
        setSubmitting(false);
        return;
      }
    }

    try {
      await verifyDonationByNgo(donationId, {
        confirmedAmount: amountToSend,
        status: nextStatus,
      });

      const [freshDonationData, freshCampaignData] = await Promise.all([
        getDonationById(donationId),
        getCampaignById(campaignId),
      ]);

      const updatedDonation = freshDonationData?.donation || donation;
      const updatedCampaign = freshCampaignData?.campaign || campaign;

      setDonation(updatedDonation);
      setCampaign(updatedCampaign);

      setNotice(`Donation ${nextStatus.toLowerCase()} successfully.`);

      if (
        nextStatus === "Verified" &&
        amountToSend > 0 &&
        previousCampaignStatus === "Active" &&
        targetAmount > 0
      ) {
        const raisedAfterVerification = Number(updatedCampaign?.raisedAmount) || 0;
        const crossedTarget =
          previousRaisedAmount < targetAmount && raisedAfterVerification >= targetAmount;

        if (crossedTarget) {
          const shouldComplete = window.confirm(
            "Campaign target has been reached. Do you want to mark this campaign as Completed now?",
          );

          if (shouldComplete) {
            const completionResult = await updateCampaignStatus(campaignId, "Completed");
            setCampaign(completionResult?.campaign || updatedCampaign);
            setNotice("Donation verified and campaign marked as Completed.");
          } else {
            setNotice(
              "Donation verified successfully. Campaign target is reached; you can mark it completed later from campaign donations.",
            );
          }
        }
      }
    } catch (error) {
      console.error("Failed to review donation:", error);
      setServerError(getApiErrorMessage(error, "Could not process this donation."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <NGOCampaignShell
      title="Donation Review"
      subtitle="Inspect donor proof, confirm received amount, and decide to verify or reject the donation."
      actions={
        <button
          type="button"
          onClick={() =>
            navigate(`/ngo/campaigns/${campaignId}/donations`, {
              state: notice ? { message: notice } : null,
            })
          }
          className="rounded-lg bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-bright"
        >
          Back to donations
        </button>
      }
    >
      {notice ? (
        <p className="mb-4 rounded-lg bg-auth-success-bg px-4 py-3 text-sm text-success">{notice}</p>
      ) : null}

      {serverError ? (
        <p className="mb-4 rounded-lg bg-auth-danger-bg px-4 py-3 text-sm text-danger">{serverError}</p>
      ) : null}

      {loading ? (
        <section className="rounded-2xl bg-surface-container-high p-8 shadow-ambient">
          <p className="text-sm text-secondary">Loading donation details...</p>
        </section>
      ) : campaign && donation ? (
        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl bg-surface-container-low p-5 shadow-ambient">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Campaign</p>
                <h2 className="text-2xl font-bold tracking-[-0.01em] text-on-surface">{campaign.title}</h2>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${campaignStatusTone[campaign.status] || campaignStatusTone.Active}`}
              >
                {campaign.status}
              </span>
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

            <div className="mt-6 space-y-3 text-sm text-secondary">
              <p>
                <span className="font-semibold text-on-surface">Donor name:</span> {donation?.donorId?.name || "Unknown donor"}
              </p>
              <p>
                <span className="font-semibold text-on-surface">Donor email:</span> {donation?.donorId?.email || "No email available"}
              </p>
              <p>
                <span className="font-semibold text-on-surface">Donation type:</span> {donation.donationType}
              </p>
              <p>
                <span className="font-semibold text-on-surface">Declared amount:</span> LKR {toLkr(donation.declaredAmount)}
              </p>
              <p>
                <span className="font-semibold text-on-surface">Submitted on:</span> {formatDate(donation.createdAt)}
              </p>
              <p>
                <span className="font-semibold text-on-surface">Current status:</span>{" "}
                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold ${statusTone[donation.status] || statusTone.Pending}`}
                >
                  {donation.status}
                </span>
              </p>
              {donation.donorMessage ? (
                <p>
                  <span className="font-semibold text-on-surface">Donor note:</span> {donation.donorMessage}
                </p>
              ) : null}
            </div>
          </article>

          <article className="rounded-2xl bg-surface-container-low p-5 shadow-ambient">
            {donation.proofImageUrl ? (
              <img
                src={donation.proofImageUrl}
                alt="Donation proof"
                className="mb-5 h-64 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="mb-5 flex h-64 w-full items-center justify-center rounded-xl bg-surface-container-high">
                <p className="text-sm text-secondary">No proof image available</p>
              </div>
            )}

            {donation.status === "Pending" ? (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="confirmedAmount"
                    className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary"
                  >
                    Confirmed Amount (LKR)
                  </label>
                  <input
                    id="confirmedAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={confirmedAmount}
                    onChange={(event) => setConfirmedAmount(event.target.value)}
                    placeholder="Enter received bank transfer amount"
                    className="mt-2 w-full rounded-lg bg-surface-container-high px-4 py-3 text-sm text-on-surface outline-none"
                  />
                  <p className="mt-2 text-xs text-secondary">
                    Enter the exact received amount before verifying this donation.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleReview("Verified")}
                    className="flex-1 rounded-lg bg-success px-4 py-3 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Processing..." : "Verify donation"}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleReview("Rejected")}
                    className="flex-1 rounded-lg bg-danger px-4 py-3 text-sm font-bold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Processing..." : "Reject donation"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-surface-container-high p-4">
                <p className="text-sm text-secondary">
                  This donation has already been {donation.status.toLowerCase()} and cannot be processed again.
                </p>
              </div>
            )}
          </article>
        </section>
      ) : (
        <section className="rounded-2xl bg-surface-container-high p-8 shadow-ambient">
          <p className="text-sm text-danger">Donation details are unavailable right now.</p>
          <button
            type="button"
            onClick={() => navigate(`/ngo/campaigns/${campaignId}/donations`)}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container"
          >
            Back to donations
          </button>
        </section>
      )}
    </NGOCampaignShell>
  );
};

export default NgoDonationReviewPage;
