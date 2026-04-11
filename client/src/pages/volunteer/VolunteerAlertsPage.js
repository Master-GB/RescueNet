import React, { useEffect, useMemo, useRef, useState } from "react";
import { BellRing, MapPin, RefreshCcw, TriangleAlert } from "lucide-react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import DashboardLayout from "../../layouts/DashboardLayout";
import VolunteerSectionHeader from "../../components/volunteerDashboard/VolunteerSectionHeader";
import useAuth from "../../hooks/useAuth";
import { useVolunteerContext } from "../../contexts/VolunteerContext";
import { calculateDistance, formatDistance } from "../../utils/distanceUtils";
import { fetchHelpRequests, getCurrentCoordinates } from "../../components/volunteerDashboard/volunteerDashboardApi";
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

const isAcceptedByCurrentVolunteer = (request, currentUserId) => {
  if (!currentUserId) return false;

  const assignedVolunteerId =
    typeof request?.assignedVolunteerId === "object"
      ? request?.assignedVolunteerId?._id
      : request?.assignedVolunteerId;

  if (assignedVolunteerId && String(assignedVolunteerId) === String(currentUserId)) {
    return true;
  }

  return (request?.volunteerAcceptances || []).some((entry) => {
    const volunteerId = typeof entry?.volunteerId === "object" ? entry?.volunteerId?._id : entry?.volunteerId;
    return volunteerId && String(volunteerId) === String(currentUserId);
  });
};

const VolunteerAlertsPage = () => {
  const { user } = useAuth();
  const { addNotification, notifications } = useVolunteerContext();
  const currentUserId = user?._id || user?.id || null;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(null);
  const previousAlertsRef = useRef(new Map());
  const geofenceNotifiedRef = useRef(new Set());

  const pushUiNotification = (payload) => {
    addNotification({
      ...payload,
      createdAt: new Date().toISOString(),
    });
  };

  const pushBrowserNotification = (title, body, tag) => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    new Notification(title, {
      body,
      tag,
    });
  };

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

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadMyCoords = async () => {
      const coords = await getCurrentCoordinates();
      if (isMounted && coords) {
        setCurrentCoords(coords);
      }
    };

    loadMyCoords();

    return () => {
      isMounted = false;
    };
  }, []);

  const alerts = useMemo(() => {
    return requests
      .filter(
        (item) =>
          item.status === "pending" ||
          item.urgency === "high" ||
          isAcceptedByCurrentVolunteer(item, currentUserId),
      )
      .map((item) => {
        const coords = parseCoords(item.realLocation) || parseCoords(item.location);

        return {
          id: item._id,
          title: `${String(item.disasterType || "General").toUpperCase()} alert`,
          location: item.location || item.realLocation || "Unknown location",
          status: item.status || "pending",
          urgency: item.urgency || "medium",
          createdAt: item.createdAt,
          assignedVolunteerId: item.assignedVolunteerId || null,
          acceptedByCurrentVolunteer: (item.volunteerAcceptances || []).some((entry) => {
            const volunteerId = typeof entry?.volunteerId === "object" ? entry?.volunteerId?._id : entry?.volunteerId;
            return currentUserId && volunteerId && String(volunteerId) === String(currentUserId);
          }),
          coords,
        };
      });
  }, [requests, currentUserId]);

  useEffect(() => {
    const prevMap = previousAlertsRef.current;
    const nextMap = new Map();

    alerts.forEach((alert) => {
      const prev = prevMap.get(alert.id);
      nextMap.set(alert.id, {
        status: alert.status,
        urgency: alert.urgency,
        acceptedByCurrentVolunteer: alert.acceptedByCurrentVolunteer,
      });

      const isNewAlert = !prev;
      const isPriority = alert.urgency === "high";

      if (isNewAlert && isPriority) {
        pushUiNotification({
          type: "priority",
          title: "Priority Alert",
          message: `${alert.title} at ${alert.location}`,
        });
        pushBrowserNotification("Priority Alert", `${alert.title} near ${alert.location}`, `priority-${alert.id}`);
      }

      if (currentCoords && Array.isArray(alert.coords)) {
        const distanceKm = calculateDistance(currentCoords.lat, currentCoords.lon, alert.coords[0], alert.coords[1]);
        const geofenceRadiusKm = 5;
        const geofenceKey = `${alert.id}-${Math.floor(distanceKm)}`;

        if (distanceKm <= geofenceRadiusKm && !geofenceNotifiedRef.current.has(geofenceKey)) {
          geofenceNotifiedRef.current.add(geofenceKey);
          const distanceLabel = formatDistance(distanceKm);
          pushUiNotification({
            type: "geofence",
            title: "Nearby Incident",
            message: `${alert.title} is ${distanceLabel} away`,
          });
          pushBrowserNotification("Nearby Incident", `${alert.title} is ${distanceLabel} from your location`, `geo-${alert.id}`);
        }
      }

      if (prev) {
        const statusChanged = prev.status !== alert.status;
        const volunteerLostTask = prev.acceptedByCurrentVolunteer && !alert.acceptedByCurrentVolunteer;

        if (statusChanged && alert.acceptedByCurrentVolunteer) {
          pushUiNotification({
            type: "update",
            title: "Task Updated",
            message: `${alert.title} status changed to ${alert.status}`,
          });
          pushBrowserNotification("Task Updated", `${alert.title} status is now ${alert.status}`, `update-${alert.id}`);
        }

        if (volunteerLostTask) {
          pushUiNotification({
            type: "reassigned",
            title: "Task Reassigned",
            message: `${alert.title} is no longer assigned to you`,
          });
          pushBrowserNotification("Task Reassigned", `${alert.title} was reassigned`, `reassigned-${alert.id}`);
        }
      }
    });

    previousAlertsRef.current = nextMap;
  }, [alerts, currentCoords]);

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

        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-3 text-sm ${
                  item.type === "priority"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : item.type === "geofence"
                      ? "bg-amber-50 border-amber-200 text-amber-800"
                      : item.type === "reassigned"
                        ? "bg-slate-100 border-slate-300 text-slate-800"
                        : "bg-blue-50 border-blue-200 text-blue-800"
                }`}
              >
                <div className="font-semibold inline-flex items-center gap-2">
                  {item.type === "geofence" ? <MapPin className="w-4 h-4" /> : <BellRing className="w-4 h-4" />}
                  {item.title}
                </div>
                <p className="mt-1">{item.message}</p>
              </div>
            ))}
          </div>
        )}

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
