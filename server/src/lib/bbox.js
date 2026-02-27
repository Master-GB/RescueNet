export function getDefaultLKBox() {
  return {
    minLat: Number(process.env.LK_MIN_LAT ?? 5.7),
    maxLat: Number(process.env.LK_MAX_LAT ?? 10.0),
    minLng: Number(process.env.LK_MIN_LNG ?? 79.5),
    maxLng: Number(process.env.LK_MAX_LNG ?? 82.1),
  };
}

export function parseBBox(query) {
  // supports either bbox=minLng,minLat,maxLng,maxLat OR minLat/maxLat/minLng/maxLng
  if (query.bbox) {
    const parts = String(query.bbox).split(",").map(Number);
    if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
      const [minLng, minLat, maxLng, maxLat] = parts;
      return { minLat, maxLat, minLng, maxLng };
    }
  }

  const minLat = Number(query.minLat);
  const maxLat = Number(query.maxLat);
  const minLng = Number(query.minLng);
  const maxLng = Number(query.maxLng);

  if (![minLat, maxLat, minLng, maxLng].some(Number.isNaN)) {
    return { minLat, maxLat, minLng, maxLng };
  }

  return getDefaultLKBox();
}
