import React from "react";

const statusTone = {
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

const NGOCampaignListPanel = ({
  campaigns,
  loading,
  error,
  statusFilter,
  onStatusFilterChange,
  onCreateCampaign,
  onEditCampaign,
  onManageDonations,
  onCancelCampaign,
  cancelingCampaignId,
}) => {
  if (loading) {
    return (
      <section className="rounded-2xl bg-surface-container-high p-8 shadow-ambient">
        <p className="text-sm text-secondary">Loading your campaigns...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl bg-surface-container-high p-8 shadow-ambient">
        <p className="text-sm text-danger">{error}</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-surface-container-low p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-on-surface">My Campaigns</h2>
            <p className="text-xs text-secondary">Only campaigns created by your NGO are shown here.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value)}
              className="rounded-lg bg-surface-container-high px-3 py-2 text-sm text-on-surface outline-none"
            >
              <option value="Active">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="ALL">All statuses</option>
            </select>

            <button
              type="button"
              onClick={onCreateCampaign}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary transition hover:bg-primary-container"
            >
              Create campaign
            </button>
          </div>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-high p-8 shadow-ambient">
          <h3 className="text-xl font-bold tracking-[-0.01em] text-on-surface">
            {statusFilter === "Active" ? "No ongoing campaigns" : "No campaigns in this category"}
          </h3>
          <p className="mt-2 text-sm text-secondary">
            Start a new campaign to mobilize funds and supplies faster during critical incidents.
          </p>
          <button
            type="button"
            onClick={onCreateCampaign}
            className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary transition hover:bg-primary-container"
          >
            Create campaign
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => {
            const targetAmount = Number(campaign.targetAmount) || 0;
            const raisedAmount = Number(campaign.raisedAmount) || 0;
            const progress = targetAmount > 0 ? Math.min(100, Math.round((raisedAmount / targetAmount) * 100)) : 0;

            return (
              <article key={campaign._id} className="overflow-hidden rounded-2xl bg-surface-container-high shadow-ambient">
                {campaign.campaignImageUrl ? (
                  <img
                    src={campaign.campaignImageUrl}
                    alt={`${campaign.title} cover`}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-surface-container">
                    <p className="text-xs uppercase tracking-[0.08em] text-secondary">No cover image</p>
                  </div>
                )}

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onManageDonations(campaign)}
                      className="line-clamp-2 text-left text-lg font-bold tracking-[-0.01em] text-on-surface transition hover:text-primary"
                    >
                      {campaign.title}
                    </button>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusTone[campaign.status] || statusTone.Active}`}>
                      {campaign.status || "Active"}
                    </span>
                  </div>

                  <p className="line-clamp-3 text-sm text-secondary">{campaign.description}</p>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
                      <span>Raised</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-container">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-secondary">
                      LKR {toLkr(raisedAmount)} / {toLkr(targetAmount)}
                    </p>
                  </div>

                  <p className="text-[11px] uppercase tracking-[0.08em] text-secondary">
                    Created {formatDate(campaign.createdAt)}
                  </p>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => onManageDonations(campaign)}
                      className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container"
                    >
                      View donations
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditCampaign(campaign)}
                        className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        disabled={campaign.status === "Cancelled" || cancelingCampaignId === campaign._id}
                        onClick={() => onCancelCampaign(campaign)}
                        className="flex-1 rounded-lg bg-surface-container px-3 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-bright disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {cancelingCampaignId === campaign._id ? "Cancelling..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default NGOCampaignListPanel;
