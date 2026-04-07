import React, { useMemo, useState } from 'react';
import { ExternalLink, Loader2, Newspaper, Filter, ChevronDown, Check, X } from 'lucide-react';
import { DISASTER_TYPES } from '../../constants/disasterConstants';
import { useDisasterContext } from '../../contexts/DisasterContext';
import UpdateDetailModal from './UpdateDetailModal';

const UpdatesPanel = ({ updates, loading, error }) => {
  const { updatesFilter, setUpdatesFilter, subscriptions } = useDisasterContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const reports = updates?.reports || [];
  const disasters = updates?.disasters || [];

  const items = useMemo(() => {
    const toItem = (x, kind) => ({
      id: `${kind}-${x.id}`,
      kind,
      title: x.title,
      url: x.url,
      date: x.date,
      countries: x.countries || [],
      disasterTypes: x.disasterTypes || [],
    });

    let allItems = [...reports.map((r) => toItem(r, 'report')), ...disasters.map((d) => toItem(d, 'disaster'))]
      .filter((x) => x.title)
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

    // Apply disaster type filter
    if (updatesFilter !== 'all') {
      console.log('Debug - Filtering by:', updatesFilter);
      const filteredItems = allItems.filter((item) => {
        // Always filter by title since disasterTypes will be empty (no category field in ReliefWeb v2)
        const titleLower = item.title.toLowerCase();
        const filterLower = updatesFilter.toLowerCase();
        
        const disasterVariations = {
          'earthquake': ['earthquake', 'quake', 'seismic', 'tremor'],
          'fire': ['fire', 'wildfire', 'burn', 'flame', 'blaze'],
          'flood': ['flood', 'flooding', 'water', 'inundation'],
          'tsunami': ['tsunami', 'tidal wave', 'sea wave'],
          'cyclone': ['cyclone', 'storm', 'hurricane', 'typhoon'],
          'landslide': ['landslide', 'mudslide', 'rockslide'],
          'volcano': ['volcano', 'volcanic', 'eruption', 'lava'],
          'drought': ['drought', 'dry', 'arid'],
        };
        
        const variations = disasterVariations[filterLower] || [filterLower];
        const titleMatch = variations.some(variation => titleLower.includes(variation));
        
        if (titleMatch) {
          console.log('Debug - Matched by title:', item.title);
        }
        
        return titleMatch;
      });
      
      console.log('Debug - Filtered items count:', filteredItems.length);
      allItems = filteredItems;
    }

    return allItems.slice(0, 20); // Fetch more items for scrolling
  }, [reports, disasters, updatesFilter]);

  const selectedFilter = useMemo(() => {
    if (updatesFilter === 'all') return { label: 'All Updates', icon: Filter, color: 'gray' };
    const disasterType = DISASTER_TYPES.find(t => t.key === updatesFilter);
    return disasterType ? { 
      label: disasterType.label, 
      icon: Filter, 
      color: disasterType.color 
    } : { label: 'All Updates', icon: Filter, color: 'gray' };
  }, [updatesFilter]);

  const handleFilterSelect = (value) => {
    setUpdatesFilter(value);
    setIsDropdownOpen(false);
  };

  const clearFilter = () => {
    setUpdatesFilter('all');
    setIsDropdownOpen(false);
  };

  const handleUpdateClick = (item, e) => {
    e.preventDefault();
    setSelectedUpdate(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUpdate(null);
  };

  return (
    <>
      <div className="rounded-3xl border border-gray-200 bg-white/70 backdrop-blur-md shadow-sm overflow-hidden">
        {/* Header with Enhanced Filter */}
        <div className="px-6 py-4 border-b border-gray-200/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-extrabold text-gray-900">Live Updates</div>
                <div className="text-xs text-gray-500 font-semibold">ReliefWeb real-time feed</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {loading ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full font-semibold">
                  {items.length} items
                </span>
              )}
            </div>
          </div>

          {/* Enhanced Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl bg-${selectedFilter.color}-100 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <selectedFilter.icon className={`w-4 h-4 text-${selectedFilter.color}-600`} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">{selectedFilter.label}</div>
                  <div className="text-xs text-gray-500">Filter by disaster type</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {updatesFilter !== 'all' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilter();
                    }}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={() => handleFilterSelect('all')}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors ${
                        updatesFilter === 'all' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Filter className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="font-semibold">All Updates</span>
                      </div>
                      {updatesFilter === 'all' && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                    
                    <div className="border-t border-gray-100 my-2"></div>
                    
                    {DISASTER_TYPES.map(type => {
                      const isSubscribed = subscriptions.includes(type.key);
                      const isActive = updatesFilter === type.key;
                      
                      return (
                        <button
                          key={type.key}
                          onClick={() => handleFilterSelect(type.key)}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isActive 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl bg-${type.color}-100 flex items-center justify-center`}>
                              <span className="text-sm font-bold text-${type.color}-700">{type.label[0]}</span>
                            </div>
                            <div className="text-left">
                              <span className="font-semibold">{type.label}</span>
                              {isSubscribed && (
                                <span className="ml-2 text-xs text-gray-500">(subscribed)</span>
                              )}
                            </div>
                          </div>
                          {isActive && <Check className="w-4 h-4 text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="px-6 py-4 text-sm text-amber-700 bg-amber-50 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <X className="w-4 h-4" />
              {error?.message || 'Failed to load updates.'}
            </div>
          </div>
        )}

        <div className="p-3">
          {items.length === 0 && !loading ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Newspaper className="w-6 h-6 text-gray-500" />
              </div>
              <div className="mt-3 text-sm font-semibold text-gray-700">
                {updatesFilter === 'all' ? 'No updates available.' : `No ${selectedFilter.label} updates found.`}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {updatesFilter === 'all' 
                  ? 'ReliefWeb may block requests until appname approval.' 
                  : 'Try selecting "All Updates" or check other disaster types.'
                }
              </div>
            </div>
          ) : (
            <div>
              {/* Scroll Indicator */}
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-xs text-gray-500 font-medium">
                  Showing {Math.min(4, items.length)} of {items.length} updates
                </span>
                <span className="text-xs text-gray-400">
                  Scroll for more
                </span>
              </div>
              
              {/* Scrollable Updates Area */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                {items.map((it) => (
                  <div
                    key={it.id}
                    onClick={(e) => handleUpdateClick(it, e)}
                    className="block rounded-2xl border border-gray-200 bg-white/70 hover:bg-white hover:shadow-md transition-all duration-200 p-4 group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold text-gray-500 uppercase tracking-wide px-2 py-1 rounded-lg bg-gray-100`}>
                            {it.kind}
                          </span>
                          {it.date && (
                            <span className="text-xs text-gray-500">
                              {String(it.date).slice(0, 10)}
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                          {it.title}
                        </div>
                        {(it.countries.length > 0 || it.disasterTypes.length > 0) && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {it.countries.slice(0, 2).map((c) => (
                              <span key={c} className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                {c}
                              </span>
                            ))}
                            {it.disasterTypes.slice(0, 2).map((d) => (
                              <span key={d} className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {d}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-xs text-gray-400 group-hover:text-blue-600 transition-colors">
                          Click for details
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Update Detail Modal - Outside container for proper centering */}
      {isModalOpen && (
        <UpdateDetailModal 
          update={selectedUpdate}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default UpdatesPanel;
