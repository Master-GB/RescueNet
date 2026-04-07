import apiClient from './apiClient';

const buildBBoxParam = (bbox) => {
  if (!bbox) return undefined;
  const { minLng, minLat, maxLng, maxLat } = bbox;
  
  // Convert string coordinates to numbers for validation
  const minLngNum = parseFloat(minLng);
  const minLatNum = parseFloat(minLat);
  const maxLngNum = parseFloat(maxLng);
  const maxLatNum = parseFloat(maxLat);
  
  if (
    [minLngNum, minLatNum, maxLngNum, maxLatNum].some((v) => 
      Number.isNaN(v) || v === null || v === undefined
    )
  ) {
    return undefined;
  }
  return `${minLngNum},${minLatNum},${maxLngNum},${maxLatNum}`;
};

export const disasterService = {
  async getMap({ type, bbox, start, end, minmag, days, source }) {
    const params = {
      types: type,
      bbox: buildBBoxParam(bbox),
      start,
      end,
      minmag,
      days,
      source,
    };

    const { data } = await apiClient.get('/api/disasters/map', { params });
    return data;
  },

  async getHeatmap({ type, bbox, start, end, minmag, days, source }) {
    const params = {
      types: type,
      bbox: buildBBoxParam(bbox),
      start,
      end,
      minmag,
      days,
      source,
    };

    const { data } = await apiClient.get('/api/disasters/heatmap', { params });
    return data;
  },

  async getUpdates({ q, limit }) {
    const params = { q, limit };
    const { data } = await apiClient.get('/api/disasters/updates', { params });
    return data;
  },
};
