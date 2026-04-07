import { useEffect, useMemo, useState } from 'react';
import { disasterService } from '../../services/disasterService';
import { useDisasterContext } from '../../contexts/DisasterContext';
import { DEFAULT_BBOX } from '../../constants/disasterConstants';

export const useDisasterData = () => {
  const { activeType, layerMode, dateRange, fireDays, bbox, areaFilter } = useDisasterContext();
  const [mapData, setMapData] = useState(null);
  const [heatData, setHeatData] = useState(null);
  const [updates, setUpdates] = useState(null);
  const [loading, setLoading] = useState({ layer: false, updates: false });
  const [error, setError] = useState(null);

  const ASIA_BBOX = {
    minLng: 25,
    minLat: -13,
    maxLng: 145,
    maxLat: 60,
  };

  const WORLD_BBOX = {
    minLng: -180,
    minLat: -90,
    maxLng: 180,
    maxLat: 90,
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setError(null);
        setLoading((p) => ({ ...p, layer: true }));

        const common = {
          type: activeType,
          bbox: activeType === 'FIRE' ? DEFAULT_BBOX : // Always use Sri Lanka for FIRE
               areaFilter === 'Sri Lanka' ? DEFAULT_BBOX : 
               areaFilter === 'Asia' ? ASIA_BBOX :
               areaFilter === 'World' ? WORLD_BBOX : DEFAULT_BBOX,
          start: activeType === 'EARTHQUAKE' ? dateRange.start : undefined,
          end: activeType === 'EARTHQUAKE' ? dateRange.end : undefined,
          minmag: activeType === 'EARTHQUAKE' ? 2.5 : undefined,
          days: activeType === 'FIRE' ? fireDays : undefined,
        };

        console.log('Debug - useDisasterData called with:', {
          activeType,
          areaFilter,
          bbox: common.bbox,
          note: activeType === 'FIRE' ? 'FIRE always uses Sri Lanka bbox' : 'Using area filter bbox',
        });

        if (layerMode === 'heat') {
          console.log('Debug - Calling getHeatmap with params:', common);
          const res = await disasterService.getHeatmap(common);
          if (!mounted) return;
          setHeatData(res?.data || res);
        } else {
          console.log('Debug - Calling getMap with params:', common);
          const res = await disasterService.getMap(common);
          if (!mounted) return;
          setMapData(res?.data || res);
        }
      } catch (e) {
        if (!mounted) return;
        setError(e);
      } finally {
        if (!mounted) return;
        setLoading((p) => ({ ...p, layer: false }));
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [activeType, layerMode, dateRange.start, dateRange.end, fireDays, areaFilter]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading((p) => ({ ...p, updates: true }));
        const res = await disasterService.getUpdates({ q: areaFilter, limit: 20 });
        if (!mounted) return;
        setUpdates(res?.data || res);
      } catch (e) {
        if (!mounted) return;
        setError(e);
      } finally {
        if (!mounted) return;
        setLoading((p) => ({ ...p, updates: false }));
      }
    };

    run();
    const id = setInterval(run, 60_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const activeLayer = useMemo(() => {
    return layerMode === 'heat' ? heatData : mapData;
  }, [layerMode, heatData, mapData]);

  return {
    activeType,
    layerMode,
    activeLayer,
    mapData,
    heatData,
    updates,
    loading,
    error,
  };
};
