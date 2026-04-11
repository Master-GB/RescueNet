import React, { useEffect, useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import VolunteerSectionHeader from "../../components/volunteerDashboard/VolunteerSectionHeader";
import {
  acceptHelpRequest,
  fetchHelpRequests,
} from "../../components/volunteerDashboard/volunteerDashboardApi";
import { volunteerSidebarItems } from "./volunteerLayoutConfig";

const VolunteerRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchHelpRequests(100);
      setRequests(data?.data || []);
    } catch (error) {
      console.error("Failed to load requests:", error.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAccept = async (requestId) => {
    setBusyId(requestId);
    try {
      await acceptHelpRequest(requestId);
      setRequests((prev) =>
        prev.map((item) =>
          item._id === requestId ? { ...item, status: "assigned" } : item
        )
      );
    } catch (error) {
      console.error("Failed to accept request:", error.message);
    } finally {
      setBusyId(null);
    }
  };

  const sorted = useMemo(() => {
    return [...requests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [requests]);

  return (
    <DashboardLayout
      sidebarItems={volunteerSidebarItems}
      portalTitle="Volunteer Portal"
      avatarLetter="V"
      homePath="/volunteer-dashboard"
      searchPlaceholder="Search relief requests..."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <VolunteerSectionHeader
            title="Relief Requests"
            subtitle="Review incoming requests and quickly accept assignments"
          />
          <button
            type="button"
            onClick={loadRequests}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-500">Loading requests...</div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-500">No requests found.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs uppercase text-slate-500">
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Urgency</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((item) => (
                  <tr key={item._id} className="border-t border-slate-100 text-sm text-slate-700">
                    <td className="px-4 py-3 capitalize">{item.disasterType || "other"}</td>
                    <td className="px-4 py-3">{item.location || item.realLocation || "Unknown"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-slate-100 capitalize">{item.urgency || "medium"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 capitalize">
                        {item.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleAccept(item._id)}
                        disabled={item.status !== "pending" || busyId === item._id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-semibold"
                      >
                        {busyId === item._id ? "Accepting..." : item.status === "pending" ? "Accept" : "Accepted"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VolunteerRequestsPage;
