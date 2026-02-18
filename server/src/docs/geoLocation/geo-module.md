# RescueNet Geo Module – Complete Documentation

_Last Updated: 2026-02-18_

This document describes the **Geo Module** used in RescueNet for:
- Forward Geocoding (Search place → coordinates)
- Reverse Geocoding (Coordinates → address)
- Routing (Directions with alternatives)

All services use **free third-party APIs**:
- OpenStreetMap (Nominatim)
- OSRM (Open Source Routing Machine)

---

# Base URL

Local:
http://localhost:5000

Base Path:
/api/geo

---

# 1️⃣ Forward Geocoding

## Endpoint
GET /api/geo/geocode

## Purpose
Convert a location name into latitude and longitude.

## Query Parameters

| Parameter | Required | Type | Description |
|------------|----------|------|-------------|
| q | Yes | string | Search query (e.g., "Colombo, Sri Lanka") |
| limit | No | number | Maximum number of results (default: 5) |

## Example Request

GET http://localhost:5000/api/geo/geocode?q=Colombo,Sri Lanka&limit=5

## Example Response

{
  "success": true,
  "source": "nominatim",
  "data": [
    {
      "display_name": "Colombo, Western Province, Sri Lanka",
      "lat": "6.9271",
      "lon": "79.8612",
      "type": "city",
      "class": "place"
    }
  ]
}

---

# 2️⃣ Reverse Geocoding

## Endpoint
GET /api/geo/reverse

## Purpose
Convert coordinates into a readable address.

## Query Parameters

| Parameter | Required | Type | Description |
|------------|----------|------|-------------|
| lat | Yes | number | Latitude |
| lng | Yes | number | Longitude |
| zoom | No | number | Detail level (10–18 recommended, default: 18) |

## Example Request

GET http://localhost:5000/api/geo/reverse?lat=6.9271&lng=79.8612&zoom=18

## Example Response

{
  "success": true,
  "source": "nominatim",
  "data": {
    "display_name": "Colombo, Western Province, Sri Lanka",
    "address": {
      "city": "Colombo",
      "state": "Western Province",
      "country": "Sri Lanka"
    }
  }
}

---

# 3️⃣ Routing (OSRM)

## Endpoint
GET /api/geo/route

## Purpose
Calculate route between two coordinates.

## Required Parameters

| Parameter | Required | Type | Description |
|------------|----------|------|-------------|
| fromLng | Yes | number | Starting longitude |
| fromLat | Yes | number | Starting latitude |
| toLng | Yes | number | Destination longitude |
| toLat | Yes | number | Destination latitude |

## Optional Parameters

| Parameter | Required | Type | Description |
|------------|----------|------|-------------|
| profile | No | string | driving / walking / cycling (default: driving) |
| alternatives | No | boolean | Return multiple routes |
| overview | No | string | full / simplified / false |
| geometries | No | string | geojson / polyline / polyline6 |

## Example Request

GET http://localhost:5000/api/geo/route?fromLng=79.8612&fromLat=6.9271&toLng=80.6337&toLat=7.2906&profile=driving&alternatives=true&overview=full&geometries=geojson

## Example Response

{
  "success": true,
  "source": "osrm",
  "data": {
    "routes": [
      {
        "distance": 12345.6,
        "duration": 2345.6
      }
    ]
  }
}

---

# Parameter Explanation Summary

profile:
- driving → Car routing
- walking → Pedestrian routing
- cycling → Bicycle routing

alternatives:
- true → Returns multiple route options
- false → Only best route

overview:
- full → Detailed geometry (large response)
- simplified → Smaller optimized geometry
- false → No geometry returned

geometries:
- geojson → Best for Leaflet
- polyline → Encoded string
- polyline6 → High precision encoded

---

# Deployment Notes

- Nominatim has rate limits → Use caching.
- OSRM public server works for deployment.
- Validate lat/lng before sending request.

---

