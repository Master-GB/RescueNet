import { useEffect } from 'react';

export const useDraftSync = (
  allFilters,
  allSearchTerm,
  setAllFiltersDraft,
  setAllSearchTermDraft,
  nearbyFilters,
  nearbySearchTerm,
  setNearbyFiltersDraft,
  setNearbySearchTermDraft,
  activeTab,
  setAllSearchTermDraft_Func,
  setNearbySearchTermDraft_Func
) => {
  // Sync drafts when filters or search terms change
  useEffect(() => {
    setAllFiltersDraft(allFilters);
    setAllSearchTermDraft(allSearchTerm);
  }, [allFilters, allSearchTerm, setAllFiltersDraft, setAllSearchTermDraft]);

  useEffect(() => {
    setNearbyFiltersDraft(nearbyFilters);
    setNearbySearchTermDraft(nearbySearchTerm);
  }, [nearbyFilters, nearbySearchTerm, setNearbyFiltersDraft, setNearbySearchTermDraft]);

  // Auto-apply search term when draft changes
  useEffect(() => {
    if (activeTab === 'all') {
      setAllSearchTermDraft_Func && setAllSearchTermDraft_Func(allSearchTerm);
    } else {
      setNearbySearchTermDraft_Func && setNearbySearchTermDraft_Func(nearbySearchTerm);
    }
  }, [allSearchTerm, nearbySearchTerm, activeTab, setAllSearchTermDraft_Func, setNearbySearchTermDraft_Func]);
};
