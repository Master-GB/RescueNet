import React from "react";
import { MapPin, Clock3, TriangleAlert, ArrowRight } from "lucide-react";

const tasks = [
  {
    id: 1,
    title: "Evacuation Assistance",
    location: "Kaduwela Community Hall",
    eta: "10 min",
    priority: "Critical",
    badge: "bg-red-100 text-red-700 border-red-200",
  },
  {
    id: 2,
    title: "Medical Supply Delivery",
    location: "Boralesgamuwa Shelter",
    eta: "24 min",
    priority: "High",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    id: 3,
    title: "Family Reunification Support",
    location: "Maharagama Transit Center",
    eta: "38 min",
    priority: "Normal",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
];

const VolunteerTaskBoard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-2xl border border-slate-200 p-4 hover:bg-slate-50 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold text-slate-800">{task.title}</h4>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="w-4 h-4" />
                  <span>{task.location}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <Clock3 className="w-4 h-4" />
                  <span>ETA: {task.eta}</span>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${task.badge}`}
              >
                <TriangleAlert className="w-3.5 h-3.5" />
                {task.priority}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition">
                Accept Task
              </button>
              <button className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition inline-flex items-center gap-1">
                View Details
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VolunteerTaskBoard;
