import React, { useMemo, useState } from 'react';
import { Bell, Flame, Globe, Map as MapIcon, Radar } from 'lucide-react';
import { DISASTER_TYPES } from '../../constants/disasterConstants';
import { DisasterProvider, useDisasterContext } from '../../contexts/DisasterContext';
import { useDisasterData } from '../../hooks/disaster/useDisasterData';
import DisasterMap from './DisasterMap';
import UpdatesPanel from './UpdatesPanel';

const TypePills = () => {
  const { activeType, setActiveType, subscriptions, toggleSubscription } = useDisasterContext();

  return (
    <div className="flex flex-wrap gap-2">
      {DISASTER_TYPES.map((t) => {
        const active = t.key === activeType;
        const subscribed = subscriptions.includes(t.key);

        return (
          <div key={t.key} className="flex items-center">
            <button
              type="button"
              onClick={() => setActiveType(t.key)}
              className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
                active
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-transparent shadow'
                  : 'bg-white/70 text-gray-800 border-gray-200 hover:bg-white'
              }`}
            >
              {t.label}
            </button>
            <button
              type="button"
              onClick={() => toggleSubscription(t.key)}
              className={`ml-2 w-10 h-10 rounded-2xl border flex items-center justify-center transition-all ${
                subscribed
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-white/70 border-gray-200 text-gray-500 hover:bg-white'
              }`}
              title={subscribed ? 'Unsubscribe' : 'Subscribe'}
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

const TopBar = () => {
  const { layerMode, setLayerMode, dateRange, setDateRange, activeType, fireDays, setFireDays, areaFilter, setAreaFilter } = useDisasterContext();

  const showDate = activeType === 'EARTHQUAKE';
  const showFireDays = activeType === 'FIRE';
  const showAreaSelector = activeType !== 'FIRE'; // Hide area selector for FIRE

  const areaOptions = [
    { value: 'Sri Lanka', label: 'Sri Lanka' },
    { value: 'Asia', label: 'Asia' },
    { value: 'World', label: 'World' }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-md border border-gray-200/60 rounded-3xl p-5 shadow-sm">
      <div className="flex flex-col xl:flex-row xl:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center shadow">
            <Radar className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-gray-900">Disaster Intelligence</div>
            <div className="text-sm text-gray-600">Live layers + updates powered by public sources</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex bg-gray-100 rounded-2xl p-1 border border-gray-200">
            <button
              type="button"
              onClick={() => setLayerMode('map')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
                layerMode === 'map' ? 'bg-white shadow text-green-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              Map
            </button>
            <button
              type="button"
              onClick={() => setLayerMode('heat')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
                layerMode === 'heat' ? 'bg-white shadow text-green-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Flame className="w-4 h-4" />
              Heat
            </button>
          </div>

          {/* Area Filter - Hidden for FIRE */}
          {showAreaSelector && (
            <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-2xl px-3 py-2">
              <span className="text-xs font-semibold text-gray-600">Area</span>
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="text-sm bg-transparent outline-none font-semibold text-gray-900 border-b border-gray-300 focus:border-blue-500"
              >
                {areaOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showFireDays && (
            <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-2xl px-3 py-2">
              <span className="text-xs font-semibold text-gray-600">Last</span>
              <select
                value={fireDays}
                onChange={(e) => setFireDays(Number(e.target.value))}
                className="text-sm bg-transparent outline-none font-semibold text-gray-900 border-b border-gray-300 focus:border-blue-500"
              >
                <option value={1}>1 day</option>
                <option value={2}>2 days</option>
                <option value={3}>3 days</option>
              </select>
              <span className="text-xs font-semibold text-gray-600">of fire data</span>
            </div>
          )}

          {showDate && (
            <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-2xl px-3 py-2">
              <span className="text-xs font-semibold text-gray-600">Range</span>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))}
                className="text-sm bg-transparent outline-none"
              />
              <span className="text-gray-400">—</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))}
                className="text-sm bg-transparent outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SubscriptionSummary = () => {
  const { subscriptions } = useDisasterContext();

  const labels = useMemo(() => {
    const map = new Map(DISASTER_TYPES.map((t) => [t.key, t.label]));
    return subscriptions.map((k) => map.get(k) || k);
  }, [subscriptions]);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-lg border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-300 font-semibold">Your Alert Subscriptions</div>
          <div className="text-2xl font-extrabold mt-1">{subscriptions.length}</div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
          <Globe className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {labels.length > 0 ? (
          labels.map((l) => (
            <span key={l} className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/10">
              {l}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-300">No subscriptions yet. Tap the bell next to a type.</span>
        )}
      </div>
    </div>
  );
};

const DisasterDashboardInner = () => {
  const { activeType } = useDisasterContext();
  const { activeLayer, updates, loading, error } = useDisasterData();

  const infoText = useMemo(() => {
    if (activeType === 'EARTHQUAKE') return 'Earthquakes use USGS and require a date range.';
    if (activeType === 'FIRE') return 'Fire hotspots use FIRMS (select days below).';
    return 'Other hazards are sourced via GDACS RSS (current alerts).';
  }, [activeType]);

  return (
    <div className="space-y-6">
      <TopBar />

      <div className="bg-white/60 backdrop-blur-md border border-gray-200/60 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between">
          <div>
            <div className="text-sm text-gray-500 font-semibold">Disaster Types</div>
            <div className="text-sm text-gray-600 mt-1">{infoText}</div>
          </div>
          <TypePills />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <DisasterMap
            geo={activeLayer}
            loading={loading.layer}
            error={error}
          />
        </div>

        <div className="space-y-6">
          <SubscriptionSummary />
          <UpdatesPanel updates={updates} loading={loading.updates} error={error} />
        </div>
      </div>
    </div>
  );
};

const DisasterDashboard = () => {
  return (
    <DisasterProvider>
      <DisasterDashboardInner />
    </DisasterProvider>
  );
};

export default DisasterDashboard;
