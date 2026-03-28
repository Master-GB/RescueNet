# RescueNet Disaster Module – Full Documentation

_Last Updated: 2026-02-18_

This module aggregates **free third‑party disaster data** into consistent formats for your frontend map UI:
- **Map layers**: GeoJSON `FeatureCollection` for markers/layers (points)
- **Heatmap layers**: heatmap‑ready points `{
  lat, lng, intensity, type, meta
}`

---

## 1) What this module provides

### A) `/api/disasters/map`
**Goal:** “Give me map-ready disaster data as GeoJSON.”  
**Frontend use:** Leaflet markers, clustering, popups, layers.

### B) `/api/disasters/heatmap`
**Goal:** “Give me heatmap-ready points for visualization.”  
**Frontend use:** Leaflet heat layer (lat/lng/intensity).

### C) `/api/disasters/updates`
**Goal:** “Give me latest disaster reports for a side panel.”  
**Frontend use:** list/timeline cards (title/date/source/url).

---

## 2) Data sources (3rd-party)

### USGS (Earthquakes)
- Produces GeoJSON earthquakes
- Good for historical ranges (start/end)

### NASA FIRMS (Fire Hotspots)
- Returns CSV hotspot detections (points)
- **NRT sources often limited to <= 3 days**

### GDACS (RSS – current hazards)
- Good for **current/active** alerts (Flood, Tsunami, Cyclone/Storm, Volcano, Drought)
- RSS feeds are typically **not deep historical**

### ReliefWeb (Updates)
- Reports/disaster listings
- Often requires **approved appname** (403 until approved)

---

## 4) Environment variables

### For FIRE
- `FIRMS_MAP_KEY` (NASA FIRMS Map Key)
- `FIRMS_BASE_URL` (defaults to `https://firms.modaps.eosdis.nasa.gov`)
### For ReliefWeb
ReliefWeb (optional until approved):
- `RELIEFWEB_APPNAME=RescueNet` (only if your ReliefWeb service sends it)
- `RELIEFWEB_BASE_URL` (defaults tp `https://api.reliefweb.int/v1`)
### For USGS
-`USGS_BASE_URL`(defaults to `https://earthquake.usgs.gov`)

---

## 5) Common query parameters

### `types` (required, one at a time)
Supported values:
- `EARTHQUAKE`
- `FIRE`
- `FLOOD`
- `TSUNAMI`
- `CYCLONE`
- `STORM`
- `VOLCANO`
- `DROUGHT`
- `WILDFIRE` 

### `bbox`
Format: `minLng,minLat,maxLng,maxLat`

Examples:
- Sri Lanka (approx): `79.5,5.7,82.1,10.0`
- World: `-180,-90,180,90`

### Dates
- `start=YYYY-MM-DD`
- `end=YYYY-MM-DD`

### Type-specific params
- USGS earthquakes: `minmag` (default 2.5)
- FIRMS fires: `days` (commonly <= 3 for NRT sources)

---

# 6) API Details

## 6.1 GET `/api/disasters/map`

### Purpose
Return **GeoJSON FeatureCollection** for the requested disaster type.

### Query
| Param | Required| Meaning |
|------|----------|---------|
| start | ✅(only for USGS)  | Start date (YYYY-MM-DD) |
| end | ✅(only for USGS)  | End date (YYYY-MM-DD) |
| types | ✅ | Disaster type (ONE) |
| bbox | ❌ | bbox for filtering (default Sri Lanka) |
| minmag | ❌ | for EARTHQUAKE only |
| days | ❌ | for FIRE only (FIRMS) |

### Response (200)
```json
{
  "success": true,
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": { "type": "Point", "coordinates": [79.8612, 6.9271] },
        "properties": {
          "source": "USGS",
          "eventType": "EARTHQUAKE",
          "title": "…",
          "url": "…",
          "raw": { }
        }
      }
    ]
  }
}
```

---

## 6.2 GET `/api/disasters/heatmap`

### Purpose
Return **heatmap-ready points** (lat/lng/intensity) for the requested type.

### Query
Same as `/map`.

### Response (200)
```json
{
  "success": true,
  "data": {
    "points": [
      {
        "lat": 6.9271,
        "lng": 79.8612,
        "intensity": 0.6,
        "type": "EARTHQUAKE",
        "meta": {
          "mag": 4.2,
          "place": "…",
          "time": 1234567890
        }
      }
    ]
  }
}
```

### Intensity rules (defaults)
- USGS: `clamp(mag/6)`
- FIRMS: `clamp(frp/50)`
- GDACS: alertLevel red=1, orange=0.7, green=0.4 (fallback 0.5)

---

## 6.3 GET `/api/disasters/updates` (ReliefWeb)

### Purpose
Return list data for a UI panel (reports + disasters).

### Query
| Param | Required | Meaning |
|------|----------|---------|
| q | ❌ | search keyword/country (example: Sri Lanka) |
| limit | ❌ | max items (default 20) |

### Response (200)
```json
{
  "success": true,
  "data": {
    "reports": [{ "title":"…", "url":"…", "date":"…" }],
    "disasters": [{ "title":"…", "url":"…", "date":"…" }]
  }
}
```

### Known limitation
ReliefWeb may return **403** until your `appname` is approved.

---

# 7) Postman testing

Use the Postman collection:
- `postman_collection.json`

Recommended run order:
1. Map – EARTHQUAKE (Sri Lanka)
2. Heatmap – EARTHQUAKE
3. Map – FIRE (Sri Lanka, days=2..3)
4. Heatmap – FIRE
5. Map/Heatmap – FLOOD / CYCLONE / STORM / VOLCANO / DROUGHT or TSUNAMI (GDACS) (may return empty if no current alerts)
6. Updates – ReliefWeb (may be blocked until appname approved)

---

# 8) Troubleshooting

### FIRMS_MAP_KEY not set
- Ensure `.env` is loaded before your service is executed.
- Prefer reading env at runtime inside service.

### FIRMS returns no data for days>3
- Many NRT sources support **<= 3**.
- Use smaller days or switch to a historical collection if available.

### GDACS returns no results
- RSS feeds are **current alerts**; there might be no active events in your window/bbox.

### ReliefWeb 403 “not approved appname”
- Wait for approval from ReliefWeb.

---

