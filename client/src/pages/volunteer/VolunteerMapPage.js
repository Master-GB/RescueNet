import React, { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import DashboardLayout from "../../layouts/DashboardLayout";
import VolunteerSectionHeader from "../../components/volunteerDashboard/VolunteerSectionHeader";
import { fetchHelpRequests } from "../../components/volunteerDashboard/volunteerDashboardApi";
import { volunteerSidebarItems } from "./volunteerLayoutConfig";

const DEFAULT_CENTER = [6.9271, 79.8612];

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

const VolunteerMapPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await fetchHelpRequests(100);
        setRequests(data?.data || []);
      } catch (error) {
        console.error("Failed to load requests for map:", error.message);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  const mapped = useMemo(() => {
    return requests
      .map((request) => ({
        ...request,
        coords: parseCoords(request.realLocation),
      }))
      .filter((request) => Array.isArray(request.coords));
  }, [requests]);

  const center = mapped[0]?.coords || DEFAULT_CENTER;

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
              </MapContainer>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
              <p className="text-sm text-slate-600">
                Showing {mapped.length} geotagged requests. Requests without valid coordinates are excluded from the map.
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VolunteerMapPage;
