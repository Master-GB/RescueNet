import React, { useEffect, useMemo, useState } from "react";
import { Radio, Route, ClipboardCheck, Package, ArrowUpRight } from "lucide-react";
import {
  fetchVolunteerProfile,
  updateVolunteerAvailability,
} from "./volunteerDashboardApi";

const actions = [
  {
    id: "checkin",
    title: "Dispatch Check-In",
    description: "Confirm active status and current zone before the next assignment push.",
    icon: Radio,
    cardStyle: "border-blue-200 bg-blue-50",
    buttonStyle: "bg-blue-600 hover:bg-blue-700",
  },
  {
    id: "route",
    title: "Safe Route Plan",
    description: "Generate field-safe routes around blocked roads and high-water locations.",
    icon: Route,
    cardStyle: "border-emerald-200 bg-emerald-50",
    buttonStyle: "bg-emerald-600 hover:bg-emerald-700",
  },
  {
    id: "verify",
    title: "Task Verification",
    description: "Submit completion proof and handover notes for incident closure.",
    icon: ClipboardCheck,
    cardStyle: "border-amber-200 bg-amber-50",
    buttonStyle: "bg-amber-600 hover:bg-amber-700",
  },
  {
    id: "supplies",
    title: "Supply Update",
    description: "Report shortages and request replenishment for relief kit inventory.",
    icon: Package,
    cardStyle: "border-rose-200 bg-rose-50",
    buttonStyle: "bg-rose-600 hover:bg-rose-700",
  },
];

const nextAvailability = {
  OFFLINE: "AVAILABLE",
  AVAILABLE: "BUSY",
  BUSY: "OFFLINE",
};

const VolunteerActionCenter = () => {
  const [availability, setAvailability] = useState("OFFLINE");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchVolunteerProfile();
        setAvailability(data?.profileData?.availabilityStatus || "OFFLINE");
      } catch (error) {
        setStatusMessage(error.message || "Could not load volunteer profile status");
      }
    };

    loadProfile();
  }, []);

  const handleOpen = async (actionId) => {
    if (actionId === "checkin") {
      try {
        const next = nextAvailability[availability] || "AVAILABLE";
        const data = await updateVolunteerAvailability(next);
        setAvailability(data?.profile?.availabilityStatus || next);
        setStatusMessage(`Availability updated to ${data?.profile?.availabilityStatus || next}`);
      } catch (error) {
        setStatusMessage(error.message || "Failed to update volunteer availability");
      }
      return;
    }

    setStatusMessage(`${actionId} connected. Backend endpoint for this action is not configured yet.`);
  };

  const actionLabel = useMemo(() => {
    return `Check-In (${availability})`;
  }, [availability]);

  return (
    <div className="space-y-3">
      {statusMessage && (
        <div className="text-sm text-slate-600">{statusMessage}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {actions.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.id}
              className={`rounded-2xl border p-5 shadow-sm hover:shadow-md transition ${item.cardStyle}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Icon className="w-5 h-5 text-slate-700" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</span>
              </div>

              <h4 className="mt-4 font-bold text-slate-800">{item.id === "checkin" ? actionLabel : item.title}</h4>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>

              <button
                className={`mt-4 w-full text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition inline-flex items-center justify-center gap-2 ${item.buttonStyle}`}
                onClick={() => handleOpen(item.id)}
              >
                Open
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default VolunteerActionCenter;
