import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  Building2,
  CheckCircle2,
  CircleAlert,
  Loader2,
  Package,
  Upload,
  X,
} from "lucide-react";
import { getCampaignById } from "../../services/campaignService";
import { submitDonation } from "../../services/donationService";

const toLkr = (value = 0) => {
  const amount = Number(value) || 0;
  return amount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getProgressPercentage = (raisedAmount, targetAmount) => {
  const raised = Number(raisedAmount) || 0;
  const target = Number(targetAmount) || 0;

  if (target <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((raised / target) * 100));
};

const normalizeCampaignError = (error) => {
  const statusCode = error?.statusCode;
  const rawMessage = String(error?.message || "Failed to load campaign details.");
  const lowerMessage = rawMessage.toLowerCase();

  if (statusCode === 404 || lowerMessage.includes("not found")) {
    return "Campaign not found. It may have been removed or is no longer active.";
  }

  return rawMessage;
};

const DonationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [campaignError, setCampaignError] = useState("");

  const [donationType, setDonationType] = useState("Money");
  const [declaredAmount, setDeclaredAmount] = useState("");
  const [suppliesDescription, setSuppliesDescription] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [proofImage, setProofImage] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const progress = useMemo(
    () => getProgressPercentage(campaign?.raisedAmount, campaign?.targetAmount),
    [campaign?.raisedAmount, campaign?.targetAmount],
  );

  const loadCampaign = useCallback(async () => {
    setLoadingCampaign(true);
    setCampaignError("");

    try {
      const response = await getCampaignById(id);
      setCampaign(response?.campaign || null);
    } catch (error) {
      console.error(
        `[DonationDetailsPage] Failed to load campaign ${id} (status ${error?.statusCode ?? "unknown"}):`,
        error,
      );
      setCampaignError(normalizeCampaignError(error));
    } finally {
      setLoadingCampaign(false);
    }
  }, [id]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  const handleProofImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setProofImage(null);
      return;
    }

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setSubmitError("Please upload a JPEG or PNG image as proof.");
      return;
    }

    setSubmitError("");
    setProofImage(file);
  };

  const buildDonationMessage = () => {
    const cleanDonorMessage = String(donorMessage || "").trim();

    if (donationType !== "Supplies") {
      return cleanDonorMessage;
    }

    const cleanSuppliesDescription = String(suppliesDescription || "").trim();
    if (!cleanSuppliesDescription) {
      return cleanDonorMessage;
    }

    if (!cleanDonorMessage) {
      return `Supplies: ${cleanSuppliesDescription}`;
    }

    return `Supplies: ${cleanSuppliesDescription}\n\nDonor note: ${cleanDonorMessage}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    if (!campaign) {
      setSubmitError("Campaign details are unavailable. Please reload this page.");
      return;
    }

    if (campaign.status !== "Active") {
      setSubmitError("This campaign is not active. You cannot submit a new donation.");
      return;
    }

    if (!proofImage) {
      setSubmitError("Proof image is required to process your donation");
      return;
    }

    if (donationType === "Money") {
      const amount = Number(declaredAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        setSubmitError("Please enter a valid declared amount greater than zero.");
        return;
      }
    }

    if (donationType === "Supplies" && !String(suppliesDescription || "").trim()) {
      setSubmitError("Please describe the supplies you are donating.");
      return;
    }

    const payload = {
      campaignId: id,
      donationType,
      declaredAmount: donationType === "Money" ? String(Number(declaredAmount)) : "0",
      donorMessage: buildDonationMessage(),
      proofImage,
    };

    setSubmitting(true);

    try {
      await submitDonation(payload);
      setShowSuccessModal(true);
      setDeclaredAmount("");
      setSuppliesDescription("");
      setDonorMessage("");
      setProofImage(null);
    } catch (error) {
      const statusCode = error?.statusCode;
      const rawMessage = String(error?.message || "Failed to submit donation.");
      const lowerMessage = rawMessage.toLowerCase();

      console.error(
        `[DonationDetailsPage] Donation submit failed (status ${statusCode ?? "unknown"}): ${rawMessage}`,
        error,
      );

      if (lowerMessage.includes("api_key") || lowerMessage.includes("cloudinary")) {
        console.error(
          "Donation submission debug hint: check server CLOUDINARY_API_KEY/CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_SECRET in .env",
        );
      }

      if (statusCode === 400 && lowerMessage.includes("proof image is required")) {
        setSubmitError("Proof image is required to process your donation");
      } else if (statusCode === 404 || lowerMessage.includes("campaign not found")) {
        setSubmitError("This campaign is no longer available. Please return to Donations and choose another campaign.");
      } else if (statusCode === 400 && lowerMessage.includes("not active")) {
        setSubmitError("This campaign is no longer active and cannot accept new donations.");
      } else {
        setSubmitError(rawMessage || "Unable to submit donation right now. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const acceptedItems = Array.isArray(campaign?.acceptedItems)
    ? campaign.acceptedItems.filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={() => navigate("/donations")}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </button>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Donation Details</p>
      </section>

      {loadingCampaign ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">Loading campaign details...</p>
        </section>
      ) : null}

      {!loadingCampaign && campaignError ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <h2 className="text-base font-semibold text-red-800">Unable to load campaign</h2>
              <p className="mt-1 text-sm text-red-700">{campaignError}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadCampaign}
                  className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/donations")}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Return to Donations
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {!loadingCampaign && !campaignError && campaign ? (
        <>
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {campaign?.campaignImageUrl ? (
              <img
                src={campaign.campaignImageUrl}
                alt={`${campaign?.title || "Campaign"} header`}
                className="h-72 w-full object-cover"
              />
            ) : (
              <div className="flex h-56 items-center justify-center bg-slate-100">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  No Campaign Image
                </span>
              </div>
            )}

            <div className="space-y-5 p-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{campaign?.title}</h1>
                <p className="mt-2 text-sm text-slate-700">{campaign?.description}</p>
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  <Building2 className="h-4 w-4" />
                  Hosted by {campaign?.ngoId?.name || "Unknown NGO"}
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <span>Raised</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200">
                  <div
                    className="h-3 rounded-full bg-emerald-600"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  LKR {toLkr(campaign?.raisedAmount)} / {toLkr(campaign?.targetAmount)}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Bank Details</h2>
              <div className="space-y-3 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-slate-900">Account Name:</span>{" "}
                  {campaign?.bankDetails?.accountName || "-"}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Account Number:</span>{" "}
                  {campaign?.bankDetails?.accountNumber || "-"}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Bank Name:</span>{" "}
                  {campaign?.bankDetails?.bankName || "-"}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Branch Name:</span>{" "}
                  {campaign?.bankDetails?.branchName || "-"}
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Accepted Supplies</h2>
              {acceptedItems.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {acceptedItems.map((item) => (
                    <span
                      key={`${campaign._id}-${item}`}
                      className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No specific supply items listed for this campaign yet.</p>
              )}
            </article>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Make a Donation</h2>
            <p className="mt-1 text-sm text-slate-600">
              Choose donation type, add your details, and upload a JPEG/PNG proof image (bank slip or supplies photo).
            </p>

            {submitError ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}

            <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">Donation Type</label>
                <div className="inline-flex rounded-xl border border-slate-300 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDonationType("Money");
                      setSubmitError("");
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      donationType === "Money"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Banknote className="mr-2 inline h-4 w-4" />
                    Money
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDonationType("Supplies");
                      setSubmitError("");
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      donationType === "Supplies"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Package className="mr-2 inline h-4 w-4" />
                    Supplies
                  </button>
                </div>
              </div>

              {donationType === "Money" ? (
                <div>
                  <label htmlFor="declaredAmount" className="mb-2 block text-sm font-semibold text-slate-800">
                    Declared Amount (LKR)
                  </label>
                  <input
                    id="declaredAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={declaredAmount}
                    onChange={(event) => setDeclaredAmount(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500"
                    placeholder="5000"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="suppliesDescription" className="mb-2 block text-sm font-semibold text-slate-800">
                    Supplies Description
                  </label>
                  <textarea
                    id="suppliesDescription"
                    rows={4}
                    value={suppliesDescription}
                    onChange={(event) => setSuppliesDescription(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500"
                    placeholder="Example: 5 bags of rice, 20 water bottles, 10 blankets"
                  />
                </div>
              )}

              <div>
                <label htmlFor="donorMessage" className="mb-2 block text-sm font-semibold text-slate-800">
                  Message (Optional)
                </label>
                <textarea
                  id="donorMessage"
                  rows={3}
                  value={donorMessage}
                  onChange={(event) => setDonorMessage(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500"
                  placeholder="Write a short note for the NGO"
                />
              </div>

              <div>
                <label htmlFor="proofImage" className="mb-2 block text-sm font-semibold text-slate-800">
                  Proof of Donation (Required)
                </label>
                <div className="rounded-lg border border-slate-300 p-4">
                  <input
                    id="proofImage"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleProofImageChange}
                    className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Upload a JPEG or PNG image of your bank transfer slip or donated supplies.
                  </p>
                  {proofImage ? (
                    <p className="mt-2 text-xs font-semibold text-emerald-700">Selected file: {proofImage.name}</p>
                  ) : null}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || campaign?.status !== "Active"}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {submitting ? "Submitting..." : "Submit Donation"}
              </button>
            </form>

            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Verification flow note: raisedAmount does not increase immediately after submission. It updates only
              after NGO verification through /donations/verify/:id.
            </div>
          </section>
        </>
      ) : null}

      {showSuccessModal ? (
        <div className="fixed inset-0 z-[1301] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-500 transition hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" />
              <div>
                <h3 className="text-xl font-bold text-slate-900">Donation Submitted!</h3>
                <p className="mt-2 text-sm text-slate-700">
                  Your donation is currently <span className="font-semibold">Pending</span>. It will be verified by
                  the NGO shortly.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Stay on this Campaign
              </button>
              <button
                type="button"
                onClick={() => navigate("/donations")}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Back to Campaigns
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DonationDetailsPage;
