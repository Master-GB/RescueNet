import React from "react";
import { CloudRain, Wind, Waves, TrafficCone, Clock3 } from "lucide-react";

const cards = [
  {
    id: "weather",
    label: "Weather",
    value: "Heavy Rain",
    detail: "Visibility reduced in west corridor",
    icon: CloudRain,
  },
  {
    id: "wind",
    label: "Wind",
    value: "28 km/h",
    detail: "Moderate gusts near open shelters",
    icon: Wind,
  },
  {
    id: "flood",
    label: "Flood Level",
    value: "+18 cm",
    detail: "Above safe threshold in zone B2",
    icon: Waves,
  },
  {
    id: "roads",
    label: "Road Closures",
    value: "5 Active",
    detail: "South bridge and feeder roads blocked",
    icon: TrafficCone,
  },
];

const VolunteerFieldConditions = () => {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Field Conditions</h3>
        <div className="text-xs text-slate-500 inline-flex items-center gap-1">
          <Clock3 className="w-3.5 h-3.5" />
          Updated 3 minutes ago
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                <Icon className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-xl font-bold text-slate-800 mt-2">{item.value}</p>
              <p className="text-xs text-slate-500 mt-2">{item.detail}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default VolunteerFieldConditions;
