import React, { useEffect, useMemo, useState } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Clock3,
  Sun,
  TrafficCone,
  Waves,
  Wind,
} from "lucide-react";
import {
  fetchAreaSituation,
  fetchCurrentWeather,
  getCurrentCoordinates,
} from "./volunteerDashboardApi";

const ForecastConditionIcon = ({ condition }) => {
  const normalized = String(condition || "").toLowerCase();

  if (normalized.includes("thunder")) {
    return <CloudLightning className="w-8 h-8 text-amber-500 animate-pulse" />;
  }

  if (normalized.includes("snow") || normalized.includes("hail")) {
    return <CloudSnow className="w-8 h-8 text-sky-500 animate-pulse" />;
  }

  if (normalized.includes("drizzle")) {
    return <CloudDrizzle className="w-8 h-8 text-blue-500 animate-bounce" style={{ animationDuration: "1.8s" }} />;
  }

  if (normalized.includes("rain") || normalized.includes("shower")) {
    return <CloudRain className="w-8 h-8 text-blue-600 animate-bounce" style={{ animationDuration: "1.8s" }} />;
  }

  if (normalized.includes("fog")) {
    return <CloudFog className="w-8 h-8 text-slate-500 animate-pulse" />;
  }

  if (normalized.includes("clear") || normalized.includes("sunny")) {
    return <Sun className="w-8 h-8 text-amber-500 animate-spin" style={{ animationDuration: "8s" }} />;
  }

  if (normalized.includes("cloud") || normalized.includes("overcast")) {
    return <Cloud className="w-8 h-8 text-slate-500 animate-pulse" />;
  }

  return <Cloud className="w-8 h-8 text-slate-500" />;
};

const VolunteerFieldConditions = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
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
        setForecast(Array.isArray(weatherData?.forecast) ? weatherData.forecast : []);
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

  const forecastItems = useMemo(() => {
    return (forecast || []).slice(0, 6).map((day) => {
      const date = new Date(day.date);
      const dayLabel = Number.isNaN(date.getTime())
        ? "Day"
        : date.toLocaleDateString(undefined, { weekday: "short" });

      return {
        key: `${day.date}-${day.code}`,
        dayLabel,
        condition: day.condition || "Unknown",
        maxTemp: day.maxTemp,
        minTemp: day.minTemp,
      };
    });
  }, [forecast]);

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

      {forecastItems.length > 0 && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Upcoming Days</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {forecastItems.map((item) => (
              <div key={item.key} className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold text-slate-500">{item.dayLabel}</p>
                <div className="mt-2 flex items-center justify-center">
                  <ForecastConditionIcon condition={item.condition} />
                </div>
                <p className="text-sm font-bold text-slate-800 mt-1">{item.condition}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {item.maxTemp != null ? Math.round(item.maxTemp) : "-"}° / {item.minTemp != null ? Math.round(item.minTemp) : "-"}°
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default VolunteerFieldConditions;
