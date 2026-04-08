import React, { useEffect, useMemo, useState } from "react";
import { Users, Timer, CheckCircle2, Package } from "lucide-react";
import { fetchHelpRequests } from "./volunteerDashboardApi";

const VolunteerStatsGrid = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchHelpRequests(100);
        setRequests(data?.data || []);
      } catch (error) {
        console.error("Failed to load volunteer stats:", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const stats = useMemo(() => {
    const pendingCount = requests.filter((item) => item.status === "pending").length;
    const inProgressCount = requests.filter(
      (item) => item.status === "assigned" || item.status === "in-progress"
    ).length;
    const resolvedCount = requests.filter((item) => item.status === "resolved").length;
    const supplyCount = requests.filter((item) => item.disasterType === "other").length;

    return [
      {
        id: "open",
        title: "Open Requests",
        value: String(pendingCount),
        caption: "Status pending",
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        id: "active",
        title: "Active Operations",
        value: String(inProgressCount),
        caption: "Assigned or in-progress",
        icon: Timer,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        id: "resolved",
        title: "Resolved Requests",
        value: String(resolvedCount),
        caption: "Closed by response teams",
        icon: CheckCircle2,
        color: "text-violet-600",
        bg: "bg-violet-50",
      },
      {
        id: "supply",
        title: "General Relief Cases",
        value: String(supplyCount),
        caption: "Type marked as other",
        icon: Package,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
    ];
  }, [requests]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{item.title}</p>
                <p className="mt-2 text-3xl font-bold text-slate-800">
                  {loading ? "..." : item.value}
                </p>
                <p className="mt-2 text-xs text-slate-500">{item.caption}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default VolunteerStatsGrid;
