import React, { useEffect, useMemo, useState } from "react";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import DashboardLayout from "../../layouts/DashboardLayout";
import VolunteerSectionHeader from "../../components/volunteerDashboard/VolunteerSectionHeader";
import { fetchHelpRequests, fetchTeamPresence } from "../../components/volunteerDashboard/volunteerDashboardApi";
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

const extractCoords = (request) => {
  const fromRealLocation = parseCoords(request?.realLocation);
  if (fromRealLocation) {
    return fromRealLocation;
  }

  return parseCoords(request?.location);
};

const VolunteerMapPage = () => {
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadRequests = async ({ showLoader = false } = {}) => {
      if (showLoader && isMounted) {
        setLoading(true);
      }

      try {
        const [requestData, teamData] = await Promise.all([
          fetchHelpRequests(100),
          fetchTeamPresence(),
        ]);
        if (isMounted) {
          setRequests(requestData?.data || []);
          setVolunteers(teamData?.volunteers || []);
          setZones(teamData?.zones || []);
          setLastSyncedAt(new Date());
        }
      } catch (error) {
        console.error("Failed to load requests for map:", error.message);
        if (isMounted) {
          setRequests([]);
          setVolunteers([]);
          setZones([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRequests({ showLoader: true });

    const intervalId = setInterval(() => {
      loadRequests();
    }, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const mapped = useMemo(() => {
    return requests
      .map((request) => ({
        ...request,
        coords: extractCoords(request),
      }))
      .filter((request) => Array.isArray(request.coords));
  }, [requests]);

  const teamMarkers = useMemo(() => {
    return (volunteers || [])
      .filter((item) => item?.coords?.lat != null && item?.coords?.lon != null)
      .map((item) => ({
        ...item,
        coords: [item.coords.lat, item.coords.lon],
      }));
  }, [volunteers]);

  const center = mapped[0]?.coords || teamMarkers[0]?.coords || DEFAULT_CENTER;

  return (
    <DashboardLayout
      sidebarItems={volunteerSidebarItems}
      portalTitle="Volunteer Portal"
      avatarLetter="V"
      homePath="/volunteer-dashboard"
      searchPlaceholder="Search map incidents..."
    >
      <div className="space-y-6">
        <VolunteerSectionHeader
          title="Field Map"
          subtitle="Geotagged incident requests from citizens in need"
        />

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-500">Loading map data...</div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <MapContainer center={center} zoom={11} scrollWheelZoom style={{ height: "460px", width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {mapped.map((request) => (
                  <CircleMarker
                    key={request._id}
                    center={request.coords}
                    radius={8}
                    pathOptions={{
                      color: request.urgency === "high" ? "#dc2626" : "#2563eb",
                      fillColor: request.urgency === "high" ? "#ef4444" : "#3b82f6",
                      fillOpacity: 0.55,
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                      <div className="text-[11px] leading-snug">
                        <div className="font-semibold capitalize">{request.disasterType || "other"} request</div>
                        <div className="mt-0.5">Status: {request.status || "pending"}</div>
                        <div className="mt-0.5">Urgency: {request.urgency || "medium"}</div>
                        <div className="mt-0.5 truncate max-w-[180px]">{request.location || request.realLocation || "Unknown location"}</div>
                      </div>
                    </Tooltip>
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold capitalize">{request.disasterType || "other"} request</div>
                        <div className="mt-1">Status: {request.status || "pending"}</div>
                        <div className="mt-1">Urgency: {request.urgency || "medium"}</div>
                        <div className="mt-1">{request.location || request.realLocation}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {teamMarkers.map((volunteer) => (
                  <CircleMarker
                    key={`vol-${volunteer.userId}`}
                    center={volunteer.coords}
                    radius={6}
                    pathOptions={{
                      color: volunteer.availabilityStatus === "AVAILABLE"
                        ? "#16a34a"
                        : volunteer.availabilityStatus === "BUSY"
                          ? "#d97706"
                          : "#6b7280",
                      fillColor: volunteer.isOnline ? "#22c55e" : "#9ca3af",
                      fillOpacity: 0.8,
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                      <div className="text-[11px] leading-snug">
                        <div className="font-semibold">{volunteer.name}</div>
                        <div>Status: {volunteer.availabilityStatus}</div>
                        <div>{volunteer.isOnline ? "Online" : "Offline"}</div>
                      </div>
                    </Tooltip>
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">{volunteer.name}</div>
                        <div className="mt-1">Availability: {volunteer.availabilityStatus}</div>
                        <div className="mt-1">Connection: {volunteer.isOnline ? "Online" : "Offline"}</div>
                        <div className="mt-1">Accepted tasks: {volunteer.activeTaskCount || 0}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {(zones || []).map((zone) => (
                  <Circle
                    key={`zone-${zone.zoneId}`}
                    center={[zone.center.lat, zone.center.lon]}
                    radius={zone.radiusMeters || 500}
                    pathOptions={{
                      color: zone.severity === "high" ? "#dc2626" : zone.severity === "medium" ? "#d97706" : "#2563eb",
                      fillColor: zone.severity === "high" ? "#fca5a5" : zone.severity === "medium" ? "#fdba74" : "#93c5fd",
                      fillOpacity: 0.18,
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">Active Response Zone</div>
                        <div className="mt-1">Severity: {zone.severity}</div>
                        <div className="mt-1">Requests: {zone.requestCount}</div>
                        <div className="mt-1">High urgency: {zone.highUrgencyCount}</div>
                      </div>
                    </Popup>
                  </Circle>
                ))}
              </MapContainer>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
              <p className="text-sm text-slate-600">
                Showing {mapped.length} incident points, {teamMarkers.length} volunteer presence markers, and {zones.length} active response zones. Auto-refresh runs every 15 seconds.
              </p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-semibold text-red-700">LIVE help request point</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-700">Volunteer presence</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Last sync: {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : "Not synced yet"}
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VolunteerMapPage;
