import { listMyCampaigns } from "./campaignService";
import { listCampaignDonations } from "./donationService";
import { getNgoTaskPerformance, getNgoTasks } from "./ngoTaskService";
import { getApiErrorMessage } from "./authService";
import { getNgoProfile } from "./profileService";

const NGO_DASHBOARD_FETCH_LIMIT = 200;

const toServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const serviceError = new Error(message);
  serviceError.statusCode = error?.response?.status;
  serviceError.originalError = error;
  return serviceError;
};

const normalizeNgoProfile = (response) => {
  if (!response) {
    return null;
  }

  if (response.profileData) {
    return response.profileData;
  }

  if (response.data?.profileData) {
    return response.data.profileData;
  }

  if (response.data && typeof response.data === "object") {
    return response.data;
  }

  if (typeof response === "object") {
    return response;
  }

  return null;
};

const getCampaignDonations = async (campaign) => {
  const response = await listCampaignDonations(campaign._id);
  const donations = Array.isArray(response?.donations) ? response.donations : [];

  return donations.map((donation) => ({
    ...donation,
    campaignId: donation?.campaignId || campaign._id,
    campaignTitle: campaign.title,
  }));
};

export const fetchNgoDashboardRawData = async () => {
  try {
    const [profileResponse, tasksResponse, performanceResponse, campaignsResponse] = await Promise.all([
      getNgoProfile(),
      getNgoTasks({ page: 1, limit: NGO_DASHBOARD_FETCH_LIMIT }),
      getNgoTaskPerformance(),
      listMyCampaigns(),
    ]);

    const profile = normalizeNgoProfile(profileResponse);
    const tasks = Array.isArray(tasksResponse?.data) ? tasksResponse.data : [];
    const performance = performanceResponse?.data || null;
    const campaigns = Array.isArray(campaignsResponse?.campaigns)
      ? campaignsResponse.campaigns
      : [];

    const donationResults = await Promise.allSettled(
      campaigns.map((campaign) => getCampaignDonations(campaign)),
    );

    const donations = [];
    const donationErrors = [];

    donationResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        donations.push(...result.value);
        return;
      }

      const campaign = campaigns[index];
      donationErrors.push({
        campaignId: campaign?._id,
        campaignTitle: campaign?.title || "Unknown campaign",
        message: getApiErrorMessage(result.reason, "Could not load campaign donations."),
      });
    });

    return {
      profile,
      tasks,
      performance,
      campaigns,
      donations,
      donationErrors,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw toServiceError(error, "Failed to load NGO dashboard data.");
  }
};

export { NGO_DASHBOARD_FETCH_LIMIT };
