# RescueNet – Shelter Module Full Technical Documentation

Last Updated: 2026-02-16

---
# 1. Introduction

The Shelter Module is the core component of the RescueNet Disaster Management System.  
It enables authorities, NGOs, and volunteers to create, manage, and monitor emergency shelters in real time.

This module supports:

- Shelter creation and management
- Geo-location based search (2dsphere index)
- Smart filtering & text search
- Capacity tracking with virtual fields
- Real-time updates using Socket.IO
- Role-based access control
- Pagination and optimized querying

---
# 2. System Architecture

Backend Stack:
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.IO
- JWT Authentication (Cookie-based)
- Joi Validation

Architecture Pattern:
- MVC (Model-Controller-Router)
- Service layer for filtering logic
- Middleware for authentication & validation

---
# 3. Data Model Design

## Shelter Schema Overview

Key design decisions:
- GeoJSON location with 2dsphere index
- Virtual field for capacity.available
- Text index for smart search
- Nested support groups
- Role-based creator tracking

### Core Fields

- name (String, required)
- description (String)
- shelterType (Enum)
- images (Array)
- createdBy (User reference)
- managedBy (Array of User references)

### Address

- street
- city
- province
- postalCode

### Contact

- phone (required)
- email

### Location (GeoJSON)

location:  
- type: "Point"  
- coordinates: [longitude, latitude]

Indexed with 2dsphere for geo queries.

### Capacity System

capacity.total (required)

occupancy.current (default 0)

Virtual Field:
capacity.available = capacity.total - occupancy.current

This avoids storing derived values and ensures data consistency.

### Support Categories

supports:
- disasterTypes
- wheelchairAccess
- medical
- food
- water
- power

specialSupport:
- elderlySupport
- disabilitySupport
- pregnancySupport
- childFriendly
- petFriendly

### Status

- OPEN
- FULL
- CLOSED

---
# 4. API Endpoints

Base URL:
http://localhost:5000/api

## Create Shelter
POST /shelters/create  
Auth Required  
Roles: ADMIN, VOLUNTEER, NGO

## Get Shelter
GET /shelters/get/:id

## List Shelters
GET /shelters/get-list

Supports:
- Pagination
- Search
- Boolean filters
- Disaster type filtering

## Nearby Shelters
GET /shelters/get-nearby?lng=&lat=&radiusKm=

Uses MongoDB $near query.

## Update Shelter
PATCH /shelters/update/:id

## Delete Shelter
DELETE /shelters/delete/:id  
ADMIN only

---
# 5. Filtering & Search System

Implemented via buildShelterQuery service.

Supports:
- Text search (MongoDB text index)
- Boolean filtering
- Disaster type multi-filter
- Status filtering
- Province / city filtering

Indexes used:
- location: 2dsphere
- text index on name + address.city + address.province

---
# 6. Real-Time System (Socket.IO)

Purpose:
To notify connected users instantly when:

- Shelter is created
- Shelter is updated
- Shelter is deleted

Events:
- shelter:created
- shelter:updated
- shelter:deleted

Implementation:
- Socket server initialized in server.js
- io attached to request object
- Controllers emit events after DB operations

---
# 7. Security & Authorization

Authentication:
- JWT stored in HTTP-only cookie

Middleware:
- protect
- authorize
- validateBody

Role Access:
- ADMIN: full access
- VOLUNTEER: create/update
- NGO: create/update
- CITIZEN: read-only

---
# 8. Validation Strategy

Joi Schemas:
- shelterCreateSchema
- shelterUpdateSchema

Validations:
- Required fields
- Enum validation
- Geo coordinates format
- Capacity minimum value
- DisasterTypes array validation

---
# 9. Error Handling

Common Errors:

Unauthorized Access  
→ Missing or invalid JWT cookie

Missing required fields  
→ Validation failure

Shelter not found  
→ Invalid ID

Invalid coordinates  
→ Must be [lng, lat]

---
# 10. Testing Strategy

Manual Testing:
- Postman Collection (provided)
- Geo testing with different radius
- Filter testing with boolean flags
- Role testing with different accounts

Automated Testing:
- Unit tests for controllers
- Validation tests
- Auth middleware tests

---
# 11. Performance Considerations

- 2dsphere index for geo performance
- Text index for search
- Pagination limits (max 100)
- Avoid storing derived values
- Lean queries optional for performance

---
# 12. Deployment Considerations

Environment Variables Required:

PORT
JWT_SECRET
CLIENT_URL
MONGO_URI

Production Notes:
- Use HTTPS
- secure cookie true
- sameSite: none
- CORS restricted to frontend domain

---
# 13. Future Improvements

- Shelter resource inventory tracking
- Auto-status FULL when capacity reached
- Province-based socket rooms
- Disaster-event linking
- Analytics dashboard
- Heatmap visualization
- Admin audit logs

---
# 14. Conclusion

The Shelter Module is a scalable, real-time, geo-enabled disaster management component.

It demonstrates:
- Advanced MongoDB usage
- Secure authentication
- Role-based access
- Real-time communication
- Clean architecture principles

This module fulfills SDG Goal: Sustainable Cities and Communities by enabling efficient emergency shelter coordination.

---
End of Document
