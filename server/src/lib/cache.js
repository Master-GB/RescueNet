//Add caching (free performance + protects 3rd-party)
import NodeCache from "node-cache";

// cache for 5 minutes by default
export const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export function cacheKey(req) {
  // unique by full URL (path + query)
  return `${req.method}:${req.originalUrl}`;
}
