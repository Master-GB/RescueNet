import React, { useEffect, useMemo, useState } from "react";
import { CloudRain, Wind, Waves, TrafficCone, Clock3 } from "lucide-react";
import {
  fetchAreaSituation,
  fetchCurrentWeather,
  getCurrentCoordinates,
} from "./volunteerDashboardApi";

const VolunteerFieldConditions = () => {
  const [weather, setWeather] = useState(null);
  const [situation, setSituation] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    const loadConditions = async () => {
      try {
        const coords = await getCurrentCoordinates();
        const [weatherData, situationData] = await Promise.all([
          fetchCurrentWeather(coords),
          fetchAreaSituation(coords),
        ]);

        setWeather(weatherData?.current || null);
        setSituation(situationData?.situations?.[0] || null);
        setUpdatedAt(new Date());
      } catch (error) {
        console.error("Failed to load field conditions:", error.message);
      }
    };

    loadConditions();
  }, []);

  const cards = useMemo(() => {
    const windUnit = weather?.windSpeedUnit || "km/h";
    const affectedAreasCount = situation?.affectedAreas?.length || 0;
    const severity = situation?.severity || "low";

    return [
      {
        id: "weather",
        label: "Weather",
        value: weather?.condition || "Unavailable",
        detail: `Temperature ${Math.round(weather?.temperature || 0)}°`,
        icon: CloudRain,
      },
      {
        id: "wind",
        label: "Wind",
        value: `${Math.round(weather?.windSpeed || 0)} ${windUnit}`,
        detail: "Current wind speed",
        icon: Wind,
      },
      {
        id: "severity",
        label: "Area Severity",
        value: String(severity).toUpperCase(),
        detail: situation?.title || "No current advisory",
        icon: Waves,
      },
      {
        id: "affected",
        label: "Affected Areas",
        value: String(affectedAreasCount),
        detail: "From current area situation",
        icon: TrafficCone,
      },
    ];
  }, [situation, weather]);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Field Conditions</h3>
        <div className="text-xs text-slate-500 inline-flex items-center gap-1">
          <Clock3 className="w-3.5 h-3.5" />
          {updatedAt ? `Updated ${updatedAt.toLocaleTimeString()}` : "Loading..."}
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
