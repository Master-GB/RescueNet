# NGO Task Management API Documentation

## Overview

The NGO Task Management API allows approved NGO accounts to manage the help-request tasks that have been assigned to them by an admin. NGOs can view their task list, inspect individual task details, update the lifecycle status of each assignment (accept → in-progress → completed), and review their own performance statistics.

All routes are scoped to `PATCH`/`GET` operations on the `/api/ngo/help-requests` base path and operate exclusively on the authenticated NGO's own assignments — an NGO cannot see or modify tasks belonging to another organisation.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Base URL](#base-url)
3. [Assignment Status Flow](#assignment-status-flow)
4. [Endpoints](#endpoints)
   - [GET /](#1-list-my-assigned-tasks)
   - [GET /performance](#2-get-performance-stats)
   - [GET /:requestId](#3-get-task-detail)
   - [PATCH /:requestId/accept](#4-accept-a-task)
   - [PATCH /:requestId/decline](#5-decline-a-task)
   - [PATCH /:requestId/in-progress](#6-mark-task-in-progress)
   - [PATCH /:requestId/complete](#7-mark-task-completed)
5. [Error Reference](#error-reference)
6. [Usage Notes](#usage-notes)

---

## Authentication

All endpoints require a valid JWT issued on login.

Supply the token in **one** of these ways:

| Method | How |
|---|---|
| Cookie (recommended) | Automatically sent by browser after login — no extra setup needed |
| `Authorization` header | `Authorization: Bearer <token>` |

The authenticated user must have the **`NGO`** role, and the corresponding NGO profile must have `approvalStatus: "approved"`. Requests from unapproved or pending NGOs are rejected with `403`.

---

## Base URL

```
/api/ngo/help-requests
```

All paths below are relative to this base.

---

## Assignment Status Flow

An assignment begins in the `assigned` state when an admin dispatches it. The NGO then drives it through the following lifecycle:

```
assigned ──► accepted ──► in-progress ──► completed
     │
     └──► declined
```

Each status transition is a separate PATCH endpoint. Attempting an out-of-order transition returns `400 Bad Request` with a descriptive message.

When **all** assignments on a `HelpRequest` reach a terminal state (`completed` or `declined`), the parent `HelpRequest.status` is automatically promoted to `"resolved"`.

---

## Endpoints

### 1. List My Assigned Tasks

**`GET /`**

Returns a paginated list of all `HelpRequest` documents that contain at least one assignment belonging to the authenticated NGO. Binary fields (`voiceMessage`, `images`) are excluded from list responses to keep payloads small.

#### Query Parameters

| Parameter | Type   | Required | Default | Description |
|-----------|--------|----------|---------|-------------|
| `status`  | String | No       | —       | Filter by assignment status: `assigned`, `accepted`, `declined`, `in-progress`, `completed` |
| `page`    | Number | No       | `1`     | Page number (min: 1) |
| `limit`   | Number | No       | `10`    | Items per page (min: 1, max: 50) |

#### Example Request

```
GET /api/ngo/help-requests?status=assigned&page=1&limit=5
Authorization: Bearer <token>
```

#### Example Response — `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c0d",
      "name": "Kasun Perera",
      "location": "Colombo 07",
      "realLocation": "Colombo",
      "contactNumber": "+94771234567",
      "disasterType": "flood",
      "message": "House flooded, need evacuation for 4 people.",
      "urgency": "high",
      "weatherCondition": "Heavy rain",
      "status": "assigned",
      "assignments": [
        {
          "ngoId": "663a0b1c2d3e4f5a6b7c8d9e",
          "taskType": "General Relief",
          "status": "assigned",
          "assignedAt": "2025-02-20T08:00:00.000Z"
        }
      ],
      "adminNotes": "Priority area — assign rescue team",
      "createdAt": "2025-02-20T07:45:00.000Z",
      "updatedAt": "2025-02-20T08:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 5,
    "totalPages": 3
  }
}
```

#### Error Cases

| Status | Condition |
|--------|-----------|
| `400`  | Invalid `status` query value |
| `401`  | Missing or invalid JWT |
| `403`  | NGO profile not approved |
| `404`  | NGO profile not found |
| `500`  | Server error |

---

### 2. Get Performance Stats

**`GET /performance`**

Returns aggregate performance metrics for the authenticated NGO pulled from the NGO profile and a live aggregation of assignment status counts.

> **Important:** This route must be registered (and requested) as `/performance` — before any `/:requestId` route — to prevent Express from interpreting the string `"performance"` as a MongoDB ObjectId.

#### Example Request

```
GET /api/ngo/help-requests/performance
Authorization: Bearer <token>
```

#### Example Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "completedTasks": 14,
    "averageResponseTime": 35,
    "rating": 4.2,
    "availabilityStatus": "AVAILABLE",
    "assignmentCounts": {
      "assigned": 3,
      "accepted": 2,
      "declined": 1,
      "inProgress": 1,
      "completed": 14
    }
  }
}
```

#### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `completedTasks` | Number | Lifetime count of tasks this NGO has completed |
| `averageResponseTime` | Number \| null | Average response time in minutes (null if not yet tracked) |
| `rating` | Number | NGO's current rating (0–5) |
| `availabilityStatus` | String | `AVAILABLE`, `BUSY`, or `OFFLINE` |
| `assignmentCounts` | Object | Live count of assignments by status |

#### Error Cases

| Status | Condition |
|--------|-----------|
| `401`  | Missing or invalid JWT |
| `403`  | NGO profile not approved |
| `404`  | NGO profile not found |
| `500`  | Server error |

---

### 3. Get Task Detail

**`GET /:requestId`**

Returns the full `HelpRequest` document for a single task, including binary fields (`voiceMessage`, `images`). Only returns the document if the authenticated NGO is listed in its `assignments` array.

#### Path Parameters

| Parameter   | Type   | Required | Description |
|-------------|--------|----------|-------------|
| `requestId` | String | Yes      | MongoDB ObjectId of the HelpRequest |

#### Example Request

```
GET /api/ngo/help-requests/664f1a2b3c4d5e6f7a8b9c0d
Authorization: Bearer <token>
```

#### Example Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c0d",
    "name": "Kasun Perera",
    "location": "Colombo 07",
    "realLocation": "Colombo",
    "contactNumber": "+94771234567",
    "disasterType": "flood",
    "message": "House flooded, need evacuation for 4 people.",
    "urgency": "high",
    "weatherCondition": "Heavy rain",
    "status": "assigned",
    "assignments": [
      {
        "ngoId": "663a0b1c2d3e4f5a6b7c8d9e",
        "taskType": "General Relief",
        "status": "assigned",
        "assignedAt": "2025-02-20T08:00:00.000Z"
      }
    ],
    "adminNotes": "Priority area — assign rescue team",
    "voiceMessage": null,
    "images": [],
    "createdAt": "2025-02-20T07:45:00.000Z",
    "updatedAt": "2025-02-20T08:00:00.000Z"
  }
}
```

#### Error Cases

| Status | Condition |
|--------|-----------|
| `400`  | `requestId` is not a valid MongoDB ObjectId |
| `401`  | Missing or invalid JWT |
| `403`  | NGO profile not approved |
| `404`  | Help request not found, or not assigned to this NGO |
| `500`  | Server error |

---

### 4. Accept a Task

**`PATCH /:requestId/accept`**

Transitions the NGO's assignment status from `assigned` → `accepted`. The request ID is also added to the NGO profile's `acceptedRequests` list (duplicates are ignored).

#### Path Parameters

| Parameter   | Type   | Required | Description |
|-------------|--------|----------|-------------|
| `requestId` | String | Yes      | MongoDB ObjectId of the HelpRequest |

#### Request Body

None required.

#### Example Request

```
PATCH /api/ngo/help-requests/664f1a2b3c4d5e6f7a8b9c0d/accept
Authorization: Bearer <token>
```

#### Example Response — `200 OK`

```json
{
  "success": true,
  "message": "Task accepted successfully",
  "data": {
    "requestId": "664f1a2b3c4d5e6f7a8b9c0d",
    "assignmentStatus": "accepted"
  }
}
```

#### Error Cases

| Status | Condition |
|--------|-----------|
| `400`  | `requestId` is not a valid ObjectId |
| `400`  | Assignment is not currently in `assigned` state |
| `401`  | Missing or invalid JWT |
| `403`  | NGO profile not approved |
| `404`  | Help request not found |
| `404`  | NGO is not assigned to this help request |
| `500`  | Server error |

---

### 5. Decline a Task

**`PATCH /:requestId/decline`**

Transitions the NGO's assignment status from `assigned` → `declined`. An optional reason can be provided in the request body. The request ID is removed from the NGO profile's `acceptedRequests` list if present.

#### Path Parameters

| Parameter   | Type   | Required | Description |
|-------------|--------|----------|-------------|
| `requestId` | String | Yes      | MongoDB ObjectId of the HelpRequest |

#### Request Body

```json
{
  "reason": "We do not have capacity for flood evacuations this week."
}
```

| Field    | Type   | Required | Constraints | Description |
|----------|--------|----------|-------------|-------------|
| `reason` | String | No       | max 500 chars | Reason for declining the task |

#### Example Request

```
PATCH /api/ngo/help-requests/664f1a2b3c4d5e6f7a8b9c0d/decline
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "We do not have capacity for flood evacuations this week."
}
```

#### Example Response — `200 OK`

```json
{
  "success": true,
  "message": "Task declined",
  "data": {
    "requestId": "664f1a2b3c4d5e6f7a8b9c0d",
    "assignmentStatus": "declined",
    "declineReason": "We do not have capacity for flood evacuations this week."
  }
}
```

#### Error Cases

| Status | Condition |
|--------|-----------|
| `400`  | `requestId` is not a valid ObjectId |
| `400`  | Assignment is not currently in `assigned` state |
| `400`  | `reason` exceeds 500 characters |
| `401`  | Missing or invalid JWT |
| `403`  | NGO profile not approved |
| `404`  | Help request not found |
| `404`  | NGO is not assigned to this help request |
| `500`  | Server error |

---

### 6. Mark Task In-Progress

**`PATCH /:requestId/in-progress`**

Transitions the NGO's assignment status from `accepted` → `in-progress`. Also promotes the parent `HelpRequest.status` to `"in-progress"` if it has not already reached `"in-progress"` or `"resolved"`.

#### Path Parameters

| Parameter   | Type   | Required | Description |
|-------------|--------|----------|-------------|
| `requestId` | String | Yes      | MongoDB ObjectId of the HelpRequest |

#### Request Body

None required.

#### Example Request

```
PATCH /api/ngo/help-requests/664f1a2b3c4d5e6f7a8b9c0d/in-progress
Authorization: Bearer <token>
```

#### Example Response — `200 OK`

```json
{
  "success": true,
  "message": "Task marked as in-progress",
  "data": {
    "requestId": "664f1a2b3c4d5e6f7a8b9c0d",
    "assignmentStatus": "in-progress",
    "helpRequestStatus": "in-progress"
  }
}
```

#### Error Cases

| Status | Condition |
|--------|-----------|
| `400`  | `requestId` is not a valid ObjectId |
| `400`  | Assignment is not currently in `accepted` state |
| `401`  | Missing or invalid JWT |
| `403`  | NGO profile not approved |
| `404`  | Help request not found |
| `404`  | NGO is not assigned to this help request |
| `500`  | Server error |

---

### 7. Mark Task Completed

**`PATCH /:requestId/complete`**

Transitions the NGO's assignment status from `in-progress` → `completed`. Records the completion timestamp on the assignment and increments `completedTasks` on the NGO profile.

If **every** assignment on the `HelpRequest` is now in a terminal state (`completed` or `declined`), the parent `HelpRequest.status` is automatically set to `"resolved"` and `resolvedAt` is stamped.

#### Path Parameters

| Parameter   | Type   | Required | Description |
|-------------|--------|----------|-------------|
| `requestId` | String | Yes      | MongoDB ObjectId of the HelpRequest |

#### Request Body

None required.

#### Example Request

```
PATCH /api/ngo/help-requests/664f1a2b3c4d5e6f7a8b9c0d/complete
Authorization: Bearer <token>
```

#### Example Response — `200 OK` (task done, request still has other assignments)

```json
{
  "success": true,
  "message": "Task marked as completed",
  "data": {
    "requestId": "664f1a2b3c4d5e6f7a8b9c0d",
    "assignmentStatus": "completed",
    "completedAt": "2025-02-21T14:30:00.000Z",
    "helpRequestStatus": "in-progress",
    "helpRequestResolved": false
  }
}
```

#### Example Response — `200 OK` (all assignments done → request resolved)

```json
{
  "success": true,
  "message": "Task completed — help request fully resolved",
  "data": {
    "requestId": "664f1a2b3c4d5e6f7a8b9c0d",
    "assignmentStatus": "completed",
    "completedAt": "2025-02-21T14:30:00.000Z",
    "helpRequestStatus": "resolved",
    "helpRequestResolved": true
  }
}
```

#### Error Cases

| Status | Condition |
|--------|-----------|
| `400`  | `requestId` is not a valid ObjectId |
| `400`  | Assignment is not currently in `in-progress` state |
| `401`  | Missing or invalid JWT |
| `403`  | NGO profile not approved |
| `404`  | Help request not found |
| `404`  | NGO is not assigned to this help request |
| `500`  | Server error |

---

## Error Reference

### Standard Error Response Shape

```json
{
  "success": false,
  "message": "Human-readable description of the error",
  "error": "Raw error message (server errors only)"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Request succeeded |
| `400` | Bad request — invalid parameter or illegal state transition |
| `401` | Unauthorised — missing or invalid JWT |
| `403` | Forbidden — NGO account not yet approved by admin |
| `404` | Resource not found, or resource is inaccessible to this NGO |
| `500` | Internal server error |

---

## Usage Notes

1. **Approval gate** — Every endpoint checks that `NgoProfile.approvalStatus === "approved"`. Until an admin approves the NGO account, all requests return `403`.

2. **Ordered transitions** — Status transitions are strictly enforced. You must follow the flow:
   `assigned → accepted → in-progress → completed`
   Skipping a step or going backwards returns `400`.

3. **Decline is only from `assigned`** — An assignment can only be declined while it is still in the `assigned` state. Once accepted, it cannot be declined.

4. **List view omits binary data** — The GET `/` endpoint strips `voiceMessage` and `images` from responses for performance. Use GET `/:requestId` to retrieve a fully detailed document including those fields.

5. **Pagination limits** — The `limit` query parameter is capped at `50`. Requests with higher values are silently clamped to `50`.

6. **Idempotent accept** — Calling `/:requestId/accept` multiple times is safe: the `acceptedRequests` list on the NGO profile will not record duplicates.

7. **Automatic request resolution** — When every assignment belonging to a `HelpRequest` reaches `completed` or `declined`, the system automatically resolves the parent request without any additional admin action.
