import React, { useEffect, useMemo, useState } from "react";
import { BellRing, RefreshCcw, TriangleAlert } from "lucide-react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import DashboardLayout from "../../layouts/DashboardLayout";
import VolunteerSectionHeader from "../../components/volunteerDashboard/VolunteerSectionHeader";
import { fetchHelpRequests } from "../../components/volunteerDashboard/volunteerDashboardApi";
import { volunteerSidebarItems } from "./volunteerLayoutConfig";

const DEFAULT_CENTER = [6.9271, 79.8612];
const REFRESH_INTERVAL_MS = 15000;

const parseCoords = (raw) => {
  if (!raw || typeof raw !== "string") {
    return null;
  }

  const parts = raw.split(",").map((item) => Number(item.trim()));
  if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
    return null;
  }

  return [parts[0], parts[1]];
};

const VolunteerAlertsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadAlerts = async ({ showLoader = false } = {}) => {
      if (showLoader && isMounted) {
        setLoading(true);
      }

      try {
        const data = await fetchHelpRequests(50);
        if (isMounted) {
          setRequests(data?.data || []);
          setLastSyncedAt(new Date());
        }
      } catch (error) {
        console.error("Failed to load volunteer alerts:", error.message);
        if (isMounted) {
          setRequests([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAlerts({ showLoader: true });

    const intervalId = setInterval(() => {
      loadAlerts();
    }, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const alerts = useMemo(() => {
    return requests
      .filter((item) => item.status === "pending" || item.urgency === "high")
      .map((item) => {
        const coords = parseCoords(item.realLocation) || parseCoords(item.location);

        return {
          id: item._id,
          title: `${String(item.disasterType || "General").toUpperCase()} alert`,
          location: item.location || item.realLocation || "Unknown location",
          status: item.status || "pending",
          urgency: item.urgency || "medium",
          createdAt: item.createdAt,
          coords,
        };
      });
  }, [requests]);

  const mapAlerts = useMemo(
    () => alerts.filter((alert) => Array.isArray(alert.coords)),
    [alerts],
  );

  const center = mapAlerts[0]?.coords || DEFAULT_CENTER;

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
            onClick={() => window.location.reload()}
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
          <>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Live Alert Locations</h3>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <MapContainer center={center} zoom={11} scrollWheelZoom style={{ height: "320px", width: "100%" }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {mapAlerts.map((alert) => (
                    <CircleMarker
                      key={alert.id}
                      center={alert.coords}
                      radius={7}
                      pathOptions={{
                        color: alert.urgency === "high" ? "#dc2626" : "#f59e0b",
                        fillColor: alert.urgency === "high" ? "#ef4444" : "#f59e0b",
                        fillOpacity: 0.55,
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                        <div className="text-[11px] leading-snug">
                          <div className="font-semibold">{alert.title}</div>
                          <div className="mt-0.5">Status: {alert.status}</div>
                          <div className="mt-0.5">Urgency: {alert.urgency}</div>
                        </div>
                      </Tooltip>
                      <Popup>
                        <div className="text-sm">
                          <div className="font-semibold">{alert.title}</div>
                          <div className="mt-1">{alert.location}</div>
                          <div className="mt-1">{new Date(alert.createdAt).toLocaleString()}</div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
              <p className="text-xs text-slate-500">
                Showing {mapAlerts.length} alerts with valid coordinates. Last sync: {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : "Not synced yet"}
              </p>
            </div>

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
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VolunteerAlertsPage;
