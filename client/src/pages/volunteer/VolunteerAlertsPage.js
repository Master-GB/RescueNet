import React, { useEffect, useMemo, useState } from "react";
import { BellRing, RefreshCcw, TriangleAlert } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import VolunteerSectionHeader from "../../components/volunteerDashboard/VolunteerSectionHeader";
import { fetchHelpRequests } from "../../components/volunteerDashboard/volunteerDashboardApi";
import { volunteerSidebarItems } from "./volunteerLayoutConfig";

const VolunteerAlertsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchHelpRequests(50);
      setRequests(data?.data || []);
    } catch (error) {
      console.error("Failed to load volunteer alerts:", error.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const alerts = useMemo(() => {
    return requests
      .filter((item) => item.status === "pending" || item.urgency === "high")
      .map((item) => ({
        id: item._id,
        title: `${String(item.disasterType || "General").toUpperCase()} alert`,
        location: item.location || item.realLocation || "Unknown location",
        status: item.status,
        urgency: item.urgency || "medium",
        createdAt: item.createdAt,
      }));
  }, [requests]);

  return (
    <DashboardLayout
      sidebarItems={volunteerSidebarItems}
      portalTitle="Volunteer Portal"
      avatarLetter="V"
      homePath="/volunteer-dashboard"
      searchPlaceholder="Search alerts by type, urgency, or location..."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <VolunteerSectionHeader
            title="Team Alerts"
            subtitle="Critical and pending incidents requiring responder awareness"
          />
          <button
            type="button"
            onClick={loadAlerts}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-500">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-500">No active alerts right now.</div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <article key={alert.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-800 inline-flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-blue-600" />
                      {alert.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2">{alert.location}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                      alert.urgency === "high"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : alert.urgency === "medium"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    <TriangleAlert className="w-3.5 h-3.5" />
                    {alert.urgency}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VolunteerAlertsPage;
