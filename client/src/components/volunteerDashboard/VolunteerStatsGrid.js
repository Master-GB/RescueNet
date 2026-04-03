import React from "react";
import { Users, Timer, CheckCircle2, Package } from "lucide-react";

const stats = [
  {
    id: "active",
    title: "Active Volunteers",
    value: "128",
    caption: "Across 6 zones",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "response",
    title: "Avg Response Time",
    value: "7m",
    caption: "Last 24 hours",
    icon: Timer,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: "completed",
    title: "Tasks Completed",
    value: "342",
    caption: "+18 from yesterday",
    icon: CheckCircle2,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    id: "supplies",
    title: "Supply Requests",
    value: "12",
    caption: "Need confirmation",
    icon: Package,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const VolunteerStatsGrid = () => {
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
                <p className="mt-2 text-3xl font-bold text-slate-800">{item.value}</p>
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
