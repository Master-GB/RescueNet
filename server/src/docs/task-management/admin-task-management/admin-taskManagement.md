# Admin Task Management API

## Overview

The Admin Task Management module provides administrators with full control over the help request lifecycle and NGO (Non-Governmental Organization) management within RescueNet. Admins can triage incoming help requests, verify or reject them, assign them to approved NGOs, and monitor resolution. In parallel, admins can register, update, and remove NGO profiles that are eligible to receive assignments.

The module exposes two groups of routes:

| Route Prefix | Responsibility |
|---|---|
| `/api/admin/help-requests` | Help request lifecycle & assignment |
| `/api/admin/ngos` | NGO profile management |

---

## Authentication

**All endpoints in this module require authentication and the `ADMIN` role.**

Authentication is handled via an HTTP-only cookie set at login (`token`). The `protect` middleware verifies the JWT and attaches `req.user`; the `authorize("ADMIN")` middleware enforces role access.

| Header / Mechanism | Value |
|---|---|
| Cookie (automatic) | `token=<JWT>` |

> If you are testing via Postman, log in first using `POST /api/auth/login` and copy the returned token into the `Bearer Token` authorization field, or use the `{{token}}` environment variable.

---

## Help Request Endpoints

### 1. Get All Help Requests

```
GET /api/admin/help-requests
```

Returns a paginated list of all help requests, with optional filtering.

#### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `status` | string | No | Filter by status: `pending`, `verified`, `assigned`, `in-progress`, `resolved`, `rejected` |
| `disasterType` | string | No | Filter by disaster: `flood`, `tsunami`, `landslide`, `cyclone`, `other` |
| `urgency` | string | No | Filter by urgency: `low`, `medium`, `high` |
| `assignedTo` | string | No | Filter by NGO ObjectId, or `"unassigned"` to find requests with no assignments |
| `page` | number | No | Page number (default: `1`) |
| `limit` | number | No | Results per page (default: `20`) |

#### Example Request

```
GET /api/admin/help-requests?status=pending&urgency=high&page=1&limit=10
```

#### Example Response `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "name": "John Silva",
      "location": "Colombo, Sri Lanka",
      "contactNumber": "+94771234567",
      "realLocation": "6.9271,79.8612",
      "disasterType": "flood",
      "message": "Water level rising, need immediate evacuation.",
      "urgency": "high",
      "status": "pending",
      "assignments": [],
      "publishedToSocial": false,
      "createdAt": "2026-02-20T08:30:00.000Z",
      "updatedAt": "2026-02-20T08:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 54,
    "page": 1,
    "limit": 10,
    "totalPages": 6
  }
}
```

---

### 2. Get Single Help Request

```
GET /api/admin/help-requests/:id
```

Returns full details of a single help request including populated NGO assignment data.

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string (ObjectId) | Yes | Help request ID |

#### Example Request

```
GET /api/admin/help-requests/665f1a2b3c4d5e6f7a8b9c0d
```

#### Example Response `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "John Silva",
    "location": "Colombo, Sri Lanka",
    "contactNumber": "+94771234567",
    "realLocation": "6.9271,79.8612",
    "disasterType": "flood",
    "message": "Water level rising, need immediate evacuation.",
    "urgency": "high",
    "status": "assigned",
    "adminNotes": "Confirmed via field team.",
    "assignments": [
      {
        "ngoId": {
          "_id": "665a0b1c2d3e4f5a6b7c8d9e",
          "organizationName": "Relief Sri Lanka",
          "type": "rescue",
          "contactPerson": "Nimal Perera",
          "contactPhone": "+94777654321",
          "address": {
            "street": "12 Galle Rd",
            "city": "Colombo",
            "province": "Western",
            "postalCode": "00300"
          },
          "services": ["FOOD", "TRANSPORT"],
          "serviceDistricts": ["Colombo", "Gampaha"],
          "availabilityStatus": "AVAILABLE"
        },
        "taskType": "Flood Rescue",
        "status": "assigned",
        "assignedAt": "2026-02-20T09:15:00.000Z"
      }
    ],
    "publishedToSocial": false,
    "createdAt": "2026-02-20T08:30:00.000Z",
    "updatedAt": "2026-02-20T09:15:00.000Z"
  }
}
```

#### Error Responses

| Status | Message |
|---|---|
| `400` | `"Invalid help request ID"` |
| `404` | `"Help request not found"` |

---

### 3. Update Help Request

```
PATCH /api/admin/help-requests/:id
```

Updates admin-controlled fields on a help request. Assignments must be managed through the dedicated assign/unassign endpoints.

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string (ObjectId) | Yes | Help request ID |

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `status` | string | No | New status value (see allowed values below) |
| `adminNotes` | string | No | Admin notes for internal reference |
| `rejectionReason` | string | No | Reason for rejection |
| `publishedToSocial` | boolean | No | Whether the request is published to social media |

**Allowed `status` values:** `pending`, `verified`, `assigned`, `in-progress`, `resolved`, `rejected`

> Setting `status` to `"resolved"` automatically sets `resolvedAt` to the current timestamp.  
> Sending `assignedTo` or `assignments` in the body will result in a `400` error — use the `/assign` and `/unassign` endpoints instead.

#### Example Request Body

```json
{
  "status": "in-progress",
  "adminNotes": "NGO team is on-site. Monitoring closely.",
  "publishedToSocial": true
}
```

#### Example Response `200 OK`

```json
{
  "success": true,
  "message": "Help request updated successfully",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "status": "in-progress",
    "adminNotes": "NGO team is on-site. Monitoring closely.",
    "publishedToSocial": true,
    "assignments": [...]
  }
}
```

#### Error Responses

| Status | Message |
|---|---|
| `400` | `"Invalid help request ID"` |
| `400` | `"Invalid status. Allowed values: ..."` |
| `400` | `"Use the assign/unassign endpoints to modify assignments"` |
| `404` | `"Help request not found"` |

---

### 4. Verify Help Request

```
POST /api/admin/help-requests/:id/verify
```

Marks a help request as verified. Only requests with status `pending` can be verified.

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string (ObjectId) | Yes | Help request ID |

#### Request Body

None required.

#### Example Response `200 OK`

```json
{
  "success": true,
  "message": "Help request verified",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "status": "verified",
    ...
  }
}
```

#### Error Responses

| Status | Message |
|---|---|
| `400` | `"Invalid help request ID"` |
| `400` | `"Cannot verify request with status: <current_status>"` |
| `404` | `"Help request not found"` |

---

### 5. Reject Help Request

```
POST /api/admin/help-requests/:id/reject
```

Marks a help request as rejected with a mandatory reason.

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string (ObjectId) | Yes | Help request ID |

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `reason` | string | **Yes** | Explanation for the rejection (cannot be empty) |

#### Example Request Body

```json
{
  "reason": "Duplicate submission. Original request #665f1a2b is already being processed."
}
```

#### Example Response `200 OK`

```json
{
  "success": true,
  "message": "Help request rejected",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "status": "rejected",
    "rejectionReason": "Duplicate submission. Original request #665f1a2b is already being processed.",
    ...
  }
}
```

#### Error Responses

| Status | Message |
|---|---|
| `400` | `"Invalid help request ID"` |
| `400` | `"Rejection reason is required"` |
| `404` | `"Help request not found"` |

---

### 6. Assign Help Request to an NGO

```
POST /api/admin/help-requests/:id/assign
```

Assigns a help request to an approved NGO. The request's status is set to `"assigned"`. The NGO is notified via SMS. Multiple NGOs can be assigned to the same request; duplicate assignments are silently ignored.

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string (ObjectId) | Yes | Help request ID |

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `organizationId` | string (ObjectId) | **Yes** | The NGO profile ID to assign to |
| `taskType` | string | No | Describes the type of task (default: `"General Relief"`) |

#### Example Request Body

```json
{
  "organizationId": "665a0b1c2d3e4f5a6b7c8d9e",
  "taskType": "Flood Rescue"
}
```

#### Example Response `200 OK`

```json
{
  "success": true,
  "message": "Help request assigned to Relief Sri Lanka",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "status": "assigned",
    "assignments": [
      {
        "ngoId": {
          "_id": "665a0b1c2d3e4f5a6b7c8d9e",
          "organizationName": "Relief Sri Lanka",
          "type": "rescue",
          "contactPerson": "Nimal Perera",
          "contactPhone": "+94777654321",
          "availabilityStatus": "AVAILABLE"
        },
        "taskType": "Flood Rescue",
        "status": "assigned",
        "assignedAt": "2026-02-20T09:15:00.000Z"
      }
    ]
  }
}
```

#### Error Responses

| Status | Message |
|---|---|
| `400` | `"Invalid help request ID"` |
| `400` | `"Valid organization ID is required"` |
| `400` | `"Cannot assign to unapproved organization"` |
| `400` | `"Organization is currently OFFLINE"` |
| `404` | `"Help request not found"` |
| `404` | `"Organization not found"` |

---

### 7. Unassign Help Request from an NGO

```
POST /api/admin/help-requests/:id/unassign
```

Removes a specific NGO assignment from a help request. If the last assignment is removed and the request status was `"assigned"`, the status reverts to `"verified"`. The help request is also removed from the NGO's `assignedRequests` and `acceptedRequests` lists.

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string (ObjectId) | Yes | Help request ID |

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `organizationId` | string (ObjectId) | **Yes** | The NGO profile ID to remove from the assignment |

#### Example Request Body

```json
{
  "organizationId": "665a0b1c2d3e4f5a6b7c8d9e"
}
```

#### Example Response `200 OK`

```json
{
  "success": true,
  "message": "Help request unassigned successfully",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "status": "verified",
    "assignments": []
  }
}
```

#### Error Responses

| Status | Message |
|---|---|
| `400` | `"Invalid help request ID"` |
| `400` | `"Valid organization ID is required"` |
| `404` | `"Help request not found"` |
| `404` | `"Assignment not found for organization"` |

---

### 8. Resolve Help Request

```
POST /api/admin/help-requests/:id/resolve
```

Marks a help request as resolved and sets `resolvedAt` to the current time. Additionally, increments `completedTasks` on all NGOs whose assignment status was `"completed"` at the time of resolution.

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string (ObjectId) | Yes | Help request ID |

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `adminNotes` | string | No | Final notes to record on resolution |

#### Example Request Body

```json
{
  "adminNotes": "All affected residents evacuated. Situation stable."
}
```

#### Example Response `200 OK`

```json
{
  "success": true,
  "message": "Help request marked as resolved",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "status": "resolved",
    "resolvedAt": "2026-02-20T14:00:00.000Z",
    "adminNotes": "All affected residents evacuated. Situation stable.",
    ...
  }
}
```

#### Error Responses

| Status | Message |
|---|---|
| `400` | `"Invalid help request ID"` |
| `404` | `"Help request not found"` |

---

## NGO Management Endpoints

### 9. Register a New NGO

```
POST /api/admin/ngos/register
```

Creates an NGO profile linked to an existing user account. The new NGO is auto-approved and the linked user's role is updated to `"NGO"`.

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `userEmail` | string | **Yes** | Email of an existing user to link to this NGO |
| `registrationNumber` | string | **Yes** | Unique official registration number |
| `contactPhone` | string | **Yes** | Primary contact phone number |
| `organizationName` | string | No | Display name of the organization |
| `type` | string | No | NGO type: `food-bank`, `medical`, `shelter`, `rescue`, `relief`, `other` |
| `contactPerson` | string | No | Name of the primary contact person |
| `officialEmail` | string | No | Organization's official email address |
| `address` | object | No | Address with `street`, `city`, `province`, `postalCode` |
| `services` | string[] | No | Services provided, e.g. `["FOOD", "MEDICAL"]` |
| `serviceDistricts` | string[] | No | Districts served, e.g. `["Colombo", "Gampaha"]` |

#### Example Request Body

```json
{
  "userEmail": "contact@reliefsl.org",
  "organizationName": "Relief Sri Lanka",
  "registrationNumber": "NGO-LK-2024-0091",
  "type": "rescue",
  "contactPerson": "Nimal Perera",
  "officialEmail": "official@reliefsl.org",
  "contactPhone": "+94777654321",
  "address": {
    "street": "12 Galle Rd",
    "city": "Colombo",
    "province": "Western",
    "postalCode": "00300"
  },
  "services": ["FOOD", "TRANSPORT"],
  "serviceDistricts": ["Colombo", "Gampaha"]
}
```

#### Example Response `201 Created`

```json
{
  "success": true,
  "message": "NGO registered successfully",
  "data": {
    "ngo": {
      "_id": "665a0b1c2d3e4f5a6b7c8d9e",
      "userId": "664e9f8a7b6c5d4e3f2a1b0c",
      "organizationName": "Relief Sri Lanka",
      "registrationNumber": "NGO-LK-2024-0091",
      "type": "rescue",
      "approvalStatus": "approved",
      "verifiedByAdmin": true,
      "availabilityStatus": "AVAILABLE",
      "createdAt": "2026-02-20T07:00:00.000Z"
    },
    "userRole": "NGO"
  }
}
```

#### Error Responses

| Status | Message |
|---|---|
| `400` | `"userEmail is required."` |
| `400` | `"registrationNumber is required."` |
| `400` | `"contactPhone is required."` |
| `400` | `"This user is already linked to an NGO profile."` |
| `400` | `"Organization with this registration number already exists."` |
| `404` | `"User with email ... not found. Please register the user account first."` |

---

### 10. Get All NGOs

```
GET /api/admin/ngos
```

Returns a paginated list of all NGO profiles with optional filtering and search.

#### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `approvalStatus` | string | No | Filter: `pending`, `approved`, `rejected`, `suspended` |
| `availabilityStatus` | string | No | Filter: `AVAILABLE`, `BUSY`, `OFFLINE` |
| `type` | string | No | Filter: `food-bank`, `medical`, `shelter`, `rescue`, `relief`, `other` |
| `q` | string | No | Search by organization name, registration number, or email (case-insensitive) |
| `page` | number | No | Page number (default: `1`) |
| `limit` | number | No | Results per page (default: `20`) |

#### Example Request

```
GET /api/admin/ngos?approvalStatus=approved&type=rescue&q=relief&page=1&limit=10
```

#### Example Response `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "_id": "665a0b1c2d3e4f5a6b7c8d9e",
      "organizationName": "Relief Sri Lanka",
      "registrationNumber": "NGO-LK-2024-0091",
      "type": "rescue",
      "approvalStatus": "approved",
      "availabilityStatus": "AVAILABLE",
      "userId": {
        "_id": "664e9f8a7b6c5d4e3f2a1b0c",
        "name": "Nimal Perera",
        "email": "contact@reliefsl.org",
        "role": "NGO"
      }
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

### 11. Get Single NGO

```
GET /api/admin/ngos/:id
```

Returns full details of a single NGO profile including linked user and approving admin.

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string (ObjectId) | Yes | NGO profile ID |

#### Example Response `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "665a0b1c2d3e4f5a6b7c8d9e",
    "organizationName": "Relief Sri Lanka",
    "registrationNumber": "NGO-LK-2024-0091",
    "type": "rescue",
    "contactPerson": "Nimal Perera",
    "officialEmail": "official@reliefsl.org",
    "contactPhone": "+94777654321",
    "address": {
      "street": "12 Galle Rd",
      "city": "Colombo",
      "province": "Western",
      "postalCode": "00300"
    },
    "services": ["FOOD", "TRANSPORT"],
    "serviceDistricts": ["Colombo", "Gampaha"],
    "approvalStatus": "approved",
    "availabilityStatus": "AVAILABLE",
    "verifiedByAdmin": true,
    "completedTasks": 7,
    "rating": 4.5,
    "userId": {
      "_id": "664e9f8a7b6c5d4e3f2a1b0c",
      "name": "Nimal Perera",
      "email": "contact@reliefsl.org",
      "role": "NGO",
      "isAccountVerified": true
    },
    "approvedBy": {
      "_id": "663d8e7f6a5b4c3d2e1f0a9b",
      "name": "Admin User",
      "email": "admin@rescuenet.lk"
    }
  }
}
```

#### Error Responses

| Status | Message |
|---|---|
| `400` | `"Invalid NGO ID"` |
| `404` | `"NGO not found"` |

---

### 12. Update NGO

```
PATCH /api/admin/ngos/:id
```

Updates one or more allowed fields on an NGO profile. Setting `approvalStatus` to `"approved"` auto-sets `verifiedByAdmin: true` and records the approving admin. Setting it to `"rejected"` or `"suspended"` sets `verifiedByAdmin: false`.

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string (ObjectId) | Yes | NGO profile ID |

#### Request Body (all fields optional)

| Field | Type | Description |
|---|---|---|
| `organizationName` | string | Organization display name |
| `registrationNumber` | string | Official registration number (must be unique) |
| `type` | string | `food-bank`, `medical`, `shelter`, `rescue`, `relief`, `other` |
| `contactPerson` | string | Primary contact name |
| `officialEmail` | string | Official email address |
| `contactPhone` | string | Primary phone number |
| `alternatePhone` | string | Alternate phone number |
| `address` | object | `{ street, city, province, postalCode }` |
| `services` | string[] | e.g. `["FOOD", "MEDICAL"]` |
| `serviceDistricts` | string[] | e.g. `["Colombo"]` |
| `availabilityStatus` | string | `AVAILABLE`, `BUSY`, `OFFLINE` |
| `approvalStatus` | string | `pending`, `approved`, `rejected`, `suspended` |
| `rejectionReason` | string | Reason if rejected or suspended |
| `isActive` | boolean | Whether the NGO is active |
| `notes` | string | Internal admin notes |

#### Example Request Body

```json
{
  "availabilityStatus": "BUSY",
  "notes": "Handling major flood relief operation in Gampaha."
}
```

#### Example Response `200 OK`

```json
{
  "success": true,
  "message": "NGO updated successfully",
  "data": {
    "_id": "665a0b1c2d3e4f5a6b7c8d9e",
    "availabilityStatus": "BUSY",
    "notes": "Handling major flood relief operation in Gampaha.",
    ...
  }
}
```

#### Error Responses

| Status | Message |
|---|---|
| `400` | `"Invalid NGO ID"` |
| `400` | `"Organization with this registration number already exists."` |
| `404` | `"NGO not found"` |

---

### 13. Delete NGO

```
DELETE /api/admin/ngos/:id
```

Permanently deletes an NGO profile. Before deletion:
- All assignments of this NGO are removed from associated help requests.
- Help requests that become unassigned as a result are reverted to `"verified"`.
- The linked user's role is reverted from `"NGO"` to `"CITIZEN"`.

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string (ObjectId) | Yes | NGO profile ID |

#### Example Response `200 OK`

```json
{
  "success": true,
  "message": "NGO deleted successfully",
  "data": {
    "id": "665a0b1c2d3e4f5a6b7c8d9e"
  }
}
```

#### Error Responses

| Status | Message |
|---|---|
| `400` | `"Invalid NGO ID"` |
| `404` | `"NGO not found"` |

---

## Help Request Status Flow

The following diagram shows the allowed status transitions for a help request:

```
pending  ──► verified  ──► assigned  ──► in-progress  ──► resolved
   │                                                         
   └──────────────────────────────────────────────────────► rejected
```

| Transition | Triggered By |
|---|---|
| `pending` → `verified` | `POST /:id/verify` |
| `pending` / any → `rejected` | `POST /:id/reject` |
| `verified` → `assigned` | `POST /:id/assign` |
| `assigned` → `verified` | `POST /:id/unassign` (last NGO removed) |
| any → `in-progress` | `PATCH /:id` with `status: "in-progress"` |
| any → `resolved` | `POST /:id/resolve` |

---

## Error Reference

All error responses follow the same envelope:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": "Optional technical detail (500 only)"
}
```

| Status Code | Meaning |
|---|---|
| `400` | Bad request — invalid ID format, missing required field, or business rule violation |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — authenticated but insufficient role |
| `404` | Resource not found |
| `500` | Internal server error |

---

## Usage Notes

- **Assignment guards:** An NGO must have `approvalStatus: "approved"` to be assigned a request. Assigning to an `"OFFLINE"` NGO returns a `400` with `warning: true` — the assignment is blocked.
- **Duplicate assignment protection:** Assigning the same NGO to the same request twice is detected server-side and silently skipped.
- **SMS notification:** Every successful assignment triggers an SMS to the NGO's `contactPhone` via the SMS service.
- **Cascading delete:** Deleting an NGO updates all linked help requests and reverts the linked user's role. This operation is irreversible.
- **Pagination defaults:** All list endpoints default to `page=1` and `limit=20`. Adjust with query parameters as needed.
- **ObjectId validation:** All `:id` path parameters and body ObjectId fields are validated before any DB operation; malformed IDs return `400` immediately.
