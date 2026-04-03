import React, { useEffect, useMemo, useState } from "react";
import { RadioTower, Siren, UsersRound, ArrowRight } from "lucide-react";
import {
  fetchAreaSituation,
  fetchHelpRequests,
  getCurrentCoordinates,
} from "./volunteerDashboardApi";

const VolunteerBriefingBanner = () => {
  const [situation, setSituation] = useState(null);
  const [helpRequests, setHelpRequests] = useState([]);

  useEffect(() => {
    const loadBriefing = async () => {
      try {
        const coords = await getCurrentCoordinates();
        const [situationData, helpData] = await Promise.all([
          fetchAreaSituation(coords),
          fetchHelpRequests(50),
        ]);

        setSituation(situationData?.situations?.[0] || null);
        setHelpRequests(helpData?.data || []);
      } catch (error) {
        console.error("Failed to load volunteer briefing:", error.message);
      }
    };

    loadBriefing();
  }, []);

  const summary = useMemo(() => {
    const openAlerts = helpRequests.filter((item) => item.status === "pending").length;
    const activeCases = helpRequests.filter(
      (item) => item.status === "assigned" || item.status === "in-progress"
    ).length;

    return {
      openAlerts,
      activeCases,
      title: situation?.title || "No active alert in your area",
      message:
        situation?.message ||
        "No immediate threats detected by the area situation service. Keep your status updated.",
    };
  }, [helpRequests, situation]);

  return (
    <section className="rounded-2xl border border-emerald-700 bg-gradient-to-r from-emerald-600 to-green-700 p-6 text-white shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold tracking-wide uppercase">
            <RadioTower className="w-3.5 h-3.5" />
            Live Volunteer Briefing
          </div>
          <h2 className="mt-3 text-2xl font-bold">{summary.title}</h2>
          <p className="mt-2 text-emerald-100 max-w-3xl">{summary.message}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 min-w-fit">
          <div className="rounded-xl bg-white/15 border border-white/20 p-3">
            <p className="text-xs text-emerald-100">Open Alerts</p>
            <p className="text-2xl font-bold mt-1">{summary.openAlerts}</p>
          </div>
          <div className="rounded-xl bg-white/15 border border-white/20 p-3">
            <p className="text-xs text-emerald-100">Active Cases</p>
            <p className="text-2xl font-bold mt-1">{summary.activeCases}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button className="px-4 py-2 rounded-xl bg-white text-emerald-700 font-semibold hover:bg-emerald-50 transition inline-flex items-center gap-2">
          <Siren className="w-4 h-4" />
          Join Priority Channel
        </button>
        <button className="px-4 py-2 rounded-xl bg-emerald-800/60 border border-emerald-300/30 hover:bg-emerald-800 text-white font-semibold transition inline-flex items-center gap-2">
          <UsersRound className="w-4 h-4" />
          View Team Assignments
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};

export default VolunteerBriefingBanner;
