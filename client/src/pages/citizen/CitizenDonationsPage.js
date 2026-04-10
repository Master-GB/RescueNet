import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CircleAlert,
  HandCoins,
  RefreshCcw,
} from "lucide-react";
import { listActiveCampaigns } from "../../services/campaignService";

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

const CitizenDonationsPage = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign?.status === "Active"),
    [campaigns],
  );

  const loadCampaigns = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await listActiveCampaigns();
      const nextCampaigns = Array.isArray(response?.campaigns) ? response.campaigns : [];
      setCampaigns(nextCampaigns);
    } catch (loadError) {
      console.error("[CitizenDonationsPage] Failed to load active campaigns:", loadError);
      setError(loadError?.message || "Failed to load donation campaigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">Ongoing Donation Campaigns</h1>
            <p className="mt-1 text-sm text-emerald-800">
              Browse active campaigns and choose one to submit money or supplies with proof.
            </p>
          </div>
          <button
            type="button"
            onClick={loadCampaigns}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </section>

      {loading ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">Loading active donation campaigns...</p>
        </section>
      ) : null}

      {!loading && error ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <h2 className="text-base font-semibold text-red-800">Unable to fetch campaigns</h2>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </section>
      ) : null}

      {!loading && !error && activeCampaigns.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <HandCoins className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-3 text-xl font-bold text-slate-900">No active campaigns right now</h2>
          <p className="mt-2 text-sm text-slate-600">
            Please check back soon. New emergency campaigns appear here as NGOs publish them.
          </p>
        </section>
      ) : null}

      {!loading && !error && activeCampaigns.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {activeCampaigns.map((campaign) => {
            const progress = getProgressPercentage(campaign?.raisedAmount, campaign?.targetAmount);
            const acceptedItems = Array.isArray(campaign?.acceptedItems)
              ? campaign.acceptedItems.filter(Boolean)
              : [];

            return (
              <article
                key={campaign._id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => navigate(`/donations/${campaign._id}`)}
                >
                  {campaign?.campaignImageUrl ? (
                    <img
                      src={campaign.campaignImageUrl}
                      alt={`${campaign?.title || "Campaign"} cover`}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-slate-100">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        No Campaign Image
                      </span>
                    </div>
                  )}

                  <div className="space-y-4 p-5">
                    <div>
                      <h3 className="line-clamp-2 text-lg font-bold text-slate-900">{campaign?.title}</h3>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                        <Building2 className="h-4 w-4" />
                        {campaign?.ngoId?.name || "Unknown NGO"}
                      </p>
                    </div>

                    <p className="line-clamp-3 text-sm text-slate-700">{campaign?.description}</p>

                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-emerald-600"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-600">
                        LKR {toLkr(campaign?.raisedAmount)} / {toLkr(campaign?.targetAmount)}
                      </p>
                    </div>

                    {acceptedItems.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {acceptedItems.slice(0, 4).map((item) => (
                          <span
                            key={`${campaign._id}-${item}`}
                            className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800"
                          >
                            {item}
                          </span>
                        ))}
                        {acceptedItems.length > 4 ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            +{acceptedItems.length - 4} more
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-800">
                      View donation details
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </button>
              </article>
            );
          })}
        </section>
      ) : null}
    </div>
  );
};

export default CitizenDonationsPage;
