import React from "react";
import { Radio, Truck, Users2, CheckCircle2 } from "lucide-react";

const activities = [
  {
    id: 1,
    message: "Dispatch team V-14 confirmed route to flood zone C2.",
    time: "2 min ago",
    icon: Radio,
    iconBg: "bg-indigo-500",
  },
  {
    id: 2,
    message: "Food and water kit delivery completed at Borella center.",
    time: "11 min ago",
    icon: Truck,
    iconBg: "bg-emerald-500",
  },
  {
    id: 3,
    message: "6 displaced families checked in and assigned support staff.",
    time: "18 min ago",
    icon: Users2,
    iconBg: "bg-blue-500",
  },
  {
    id: 4,
    message: "Night shift handover finalized for zone K1.",
    time: "35 min ago",
    icon: CheckCircle2,
    iconBg: "bg-amber-500",
  },
];

const VolunteerActivityFeed = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="space-y-4">
        {activities.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-700 leading-relaxed">{item.message}</p>
                <p className="text-xs text-slate-500 mt-1">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VolunteerActivityFeed;
