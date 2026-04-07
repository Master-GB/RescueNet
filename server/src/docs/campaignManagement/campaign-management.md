# RescueNet – Donations & Campaign Management Module Full Technical Documentation

Last Updated: 2026-02-27

---

# 1. Introduction

The Donations & Campaign Management Module enables NGO users to create and manage relief campaigns (requesting monetary or physical supply donations) and share bank details with potential donors. Citizen and Volunteer users can then browse active campaigns and submit donations by uploading proof images (e.g., bank transfer slips or photos of supply packages) via Cloudinary. NGOs review pending donations and manually verify or reject them, which automatically updates the campaign's raised amount tally.

This module supports:

- Campaign creation and management (NGO only)
- Public browsing of active campaigns
- Donation submission with Cloudinary-hosted proof images
- NGO-driven donation verification workflow
- Automatic raised amount tracking via atomic updates
- Role-based access control (NGO, CITIZEN, VOLUNTEER)
- Joi validation on all mutating endpoints

---

# 2. System Architecture

Backend Stack:
- Node.js
- Express.js
- MongoDB (Mongoose)
- Cloudinary (image hosting)
- Multer + multer-storage-cloudinary (file upload)
- JWT Authentication (Cookie-based)
- Joi Validation

Architecture Pattern:
- MVC (Model-Controller-Router)
- Middleware for authentication, authorization, validation, and file upload
- Atomic `$inc` operations for concurrent-safe amount tracking

---

# 3. Data Model Design

## 3.1 Campaign Schema

| Field                     | Type             | Required | Default    | Description                                                 |
| ------------------------- | ---------------- | -------- | ---------- | ----------------------------------------------------------- |
| `ngoId`                   | ObjectId         | ✓        | —          | Reference to the NGO user who created the campaign          |
| `title`                   | String           | ✓        | —          | Campaign title (trimmed)                                    |
| `description`             | String           | ✓        | —          | Detailed campaign description                               |
| `targetAmount`            | Number           | ✓        | —          | Total amount of money needed (min: 0)                       |
| `raisedAmount`            | Number           | ✗        | `0`        | Amount raised so far (auto-incremented on verification)     |
| `status`                  | String (Enum)    | ✗        | `"Active"` | Campaign status: `Active`, `Completed`, `Cancelled`         |
| `bankDetails.accountName` | String           | ✗        | —          | Bank account holder name                                    |
| `bankDetails.accountNumber`| String          | ✗        | —          | Bank account number                                         |
| `bankDetails.bankName`    | String           | ✗        | —          | Name of the bank                                            |
| `bankDetails.branchName`  | String           | ✗        | —          | Branch name                                                 |
| `acceptedItems`           | Array of Strings | ✗        | `[]`       | Physical items accepted (e.g., `["Clothes", "Dry Rations"]`)|
| `createdAt`               | Date             | Auto     | —          | Timestamp of creation                                       |
| `updatedAt`               | Date             | Auto     | —          | Timestamp of last update                                    |

### Indexes

- `{ status: 1 }` — optimizes the "all active campaigns" query
- `{ ngoId: 1 }` — optimizes lookups by NGO owner

---

## 3.2 Donation Schema

| Field            | Type          | Required | Default      | Description                                                 |
| ---------------- | ------------- | -------- | ------------ | ----------------------------------------------------------- |
| `campaignId`     | ObjectId      | ✓        | —            | Reference to the parent Campaign                            |
| `donorId`        | ObjectId      | ✓        | —            | Reference to the donor (Citizen/Volunteer)                  |
| `donationType`   | String (Enum) | ✓        | —            | Type of donation: `Money` or `Supplies`                     |
| `declaredAmount` | Number        | ✗        | `0`          | Amount the donor claims to have sent (0 for supplies)       |
| `donorMessage`   | String        | ✗        | `""`         | Optional note from the donor                                |
| `proofImageUrl`  | String        | ✓        | —            | Cloudinary URL of the uploaded proof image                  |
| `status`         | String (Enum) | ✗        | `"Pending"`  | Donation status: `Pending`, `Verified`, `Rejected`          |
| `createdAt`      | Date          | Auto     | —            | Timestamp of creation                                       |
| `updatedAt`      | Date          | Auto     | —            | Timestamp of last update                                    |

### Indexes

- `{ campaignId: 1, status: 1 }` — compound index for the NGO review query (fetch all donations by campaign and status)

---

# 4. File Upload Configuration

Proof images are uploaded to Cloudinary via Multer middleware.

- **Storage**: `multer-storage-cloudinary` with `CloudinaryStorage`
- **Cloudinary Folder**: `rescuenet_donations`
- **Allowed Formats**: `jpeg`, `png`, `jpg`
- **Form Field Name**: `proofImage`
- **Environment Variables** (in `.env`):
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

The upload middleware is applied only on the `POST /api/donations/submit` route, before the Joi body validation middleware.

---

# 5. API Endpoints

Base URL:
```
http://localhost:5000/api
```

---

## 5.1 Campaign Endpoints

### Create Campaign

**Endpoint:** `POST /api/campaigns/create`

**Auth Required:** Yes
**Roles:** `NGO`
**Validation:** `createCampaignSchema`

**Request Body:**

```json
{
  "title": "Southern Province Flood Relief",
  "description": "Raising funds and supplies for flood-affected families in Matara and Galle districts.",
  "targetAmount": 500000,
  "bankDetails": {
    "accountName": "RescueNet Relief Fund",
    "accountNumber": "1234567890",
    "bankName": "Bank of Ceylon",
    "branchName": "Colombo Main"
  },
  "acceptedItems": ["Clothes", "Dry Rations", "Water Bottles", "Blankets"]
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Campaign created successfully",
  "campaign": {
    "_id": "665a1b2c3d4e5f6a7b8c9d0e",
    "ngoId": "664f1a2b3c4d5e6f7a8b9c0d",
    "title": "Southern Province Flood Relief",
    "description": "Raising funds and supplies for flood-affected families in Matara and Galle districts.",
    "targetAmount": 500000,
    "raisedAmount": 0,
    "status": "Active",
    "bankDetails": {
      "accountName": "RescueNet Relief Fund",
      "accountNumber": "1234567890",
      "bankName": "Bank of Ceylon",
      "branchName": "Colombo Main"
    },
    "acceptedItems": ["Clothes", "Dry Rations", "Water Bottles", "Blankets"],
    "createdAt": "2026-02-27T10:00:00.000Z",
    "updatedAt": "2026-02-27T10:00:00.000Z"
  }
}
```

---

### Update Campaign

**Endpoint:** `PUT /api/campaigns/update/:id`

**Auth Required:** Yes
**Roles:** `NGO` (owner only)
**Validation:** `updateCampaignSchema`

**Ownership Check:** The campaign's `ngoId` must match `req.user._id`. Returns `403` otherwise.

**Request Body (all fields optional):**

```json
{
  "title": "Updated Campaign Title",
  "description": "Updated description with more details about the relief effort.",
  "targetAmount": 750000,
  "status": "Completed",
  "bankDetails": {
    "accountName": "RescueNet Relief Fund",
    "accountNumber": "9876543210",
    "bankName": "Commercial Bank",
    "branchName": "Galle"
  },
  "acceptedItems": ["Clothes", "Medicine"]
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Campaign updated successfully",
  "campaign": { ... }
}
```

**Error Responses:**

| Status | Condition                        |
| ------ | -------------------------------- |
| 404    | Campaign not found               |
| 403    | NGO does not own this campaign   |
| 500    | Server/database error            |

---

### Get All Active Campaigns

**Endpoint:** `GET /api/campaigns/active`

**Auth Required:** No (Public)

**Description:** Returns all campaigns with status `Active`. Populates the NGO's `name` and `email`.

**Response:** `200 OK`

```json
{
  "success": true,
  "campaigns": [
    {
      "_id": "665a1b2c3d4e5f6a7b8c9d0e",
      "ngoId": {
        "_id": "664f1a2b3c4d5e6f7a8b9c0d",
        "name": "RescueNet NGO",
        "email": "ngo@rescuenet.org"
      },
      "title": "Southern Province Flood Relief",
      "description": "Raising funds and supplies...",
      "targetAmount": 500000,
      "raisedAmount": 125000,
      "status": "Active",
      "bankDetails": { ... },
      "acceptedItems": ["Clothes", "Dry Rations"],
      "createdAt": "2026-02-27T10:00:00.000Z",
      "updatedAt": "2026-02-27T12:30:00.000Z"
    }
  ]
}
```

---

### Get Campaign By ID

**Endpoint:** `GET /api/campaigns/:id`

**Auth Required:** No (Public)

**Description:** Returns a single campaign by its `_id`. Populates the NGO's `name` and `email`.

**Response:** `200 OK`

```json
{
  "success": true,
  "campaign": {
    "_id": "665a1b2c3d4e5f6a7b8c9d0e",
    "ngoId": {
      "_id": "664f1a2b3c4d5e6f7a8b9c0d",
      "name": "RescueNet NGO",
      "email": "ngo@rescuenet.org"
    },
    "title": "Southern Province Flood Relief",
    ...
  }
}
```

**Error Responses:**

| Status | Condition          |
| ------ | ------------------ |
| 404    | Campaign not found |
| 500    | Server error       |

---

## 5.2 Donation Endpoints

### Submit Donation

**Endpoint:** `POST /api/donations/submit`

**Auth Required:** Yes
**Roles:** `CITIZEN`, `VOLUNTEER`
**Content-Type:** `multipart/form-data`

**Description:** Submit a donation to an active campaign. The proof image (bank transfer slip or photo of supplies) is uploaded to Cloudinary. The donation starts in `Pending` status.

**Form Fields:**

| Field            | Type   | Required | Description                                 |
| ---------------- | ------ | -------- | ------------------------------------------- |
| `campaignId`     | String | ✓        | ID of the campaign being donated to         |
| `donationType`   | String | ✓        | `"Money"` or `"Supplies"`                   |
| `declaredAmount` | Number | ✗        | Amount claimed (defaults to 0)              |
| `donorMessage`   | String | ✗        | Optional note (max 500 chars)               |
| `proofImage`     | File   | ✓        | Image file (jpeg, png, or jpg)              |

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Donation submitted successfully. Awaiting NGO verification.",
  "donation": {
    "_id": "665b2c3d4e5f6a7b8c9d0e1f",
    "campaignId": "665a1b2c3d4e5f6a7b8c9d0e",
    "donorId": "664e0a1b2c3d4e5f6a7b8c9d",
    "donationType": "Money",
    "declaredAmount": 5000,
    "donorMessage": "Stay strong!",
    "proofImageUrl": "https://res.cloudinary.com/dszbqdw4l/image/upload/v1234567890/rescuenet_donations/abc123.jpg",
    "status": "Pending",
    "createdAt": "2026-02-27T11:00:00.000Z",
    "updatedAt": "2026-02-27T11:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition                          |
| ------ | ---------------------------------- |
| 400    | No proof image uploaded            |
| 400    | Campaign is not active             |
| 404    | Campaign not found                 |
| 500    | Server/upload error                |

---

### Get Campaign Donations (NGO Review)

**Endpoint:** `GET /api/donations/campaign/:campaignId`

**Auth Required:** Yes
**Roles:** `NGO` (owner only)

**Description:** Retrieves all donations for a specific campaign so the NGO can review them. Populates donor `name` and `email`.

**Ownership Check:** The campaign's `ngoId` must match `req.user._id`. Returns `403` otherwise.

**Response:** `200 OK`

```json
{
  "success": true,
  "donations": [
    {
      "_id": "665b2c3d4e5f6a7b8c9d0e1f",
      "campaignId": "665a1b2c3d4e5f6a7b8c9d0e",
      "donorId": {
        "_id": "664e0a1b2c3d4e5f6a7b8c9d",
        "name": "Jane Citizen",
        "email": "jane@example.com"
      },
      "donationType": "Money",
      "declaredAmount": 5000,
      "donorMessage": "Stay strong!",
      "proofImageUrl": "https://res.cloudinary.com/dszbqdw4l/image/upload/v1234567890/rescuenet_donations/abc123.jpg",
      "status": "Pending",
      "createdAt": "2026-02-27T11:00:00.000Z",
      "updatedAt": "2026-02-27T11:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

| Status | Condition                        |
| ------ | -------------------------------- |
| 404    | Campaign not found               |
| 403    | NGO does not own this campaign   |
| 500    | Server error                     |

---

### Verify / Reject Donation

**Endpoint:** `PUT /api/donations/verify/:donationId`

**Auth Required:** Yes
**Roles:** `NGO` (campaign owner only)
**Validation:** `verifyDonationSchema`

**Description:** Allows the campaign-owning NGO to verify or reject a pending donation. If the donation is verified with `confirmedAmount > 0`, the parent campaign's `raisedAmount` is atomically incremented using MongoDB's `$inc` operator.

**Request Body:**

```json
{
  "confirmedAmount": 5000,
  "status": "Verified"
}
```

Or to reject:

```json
{
  "confirmedAmount": 0,
  "status": "Rejected"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Donation verified successfully",
  "donation": {
    "_id": "665b2c3d4e5f6a7b8c9d0e1f",
    "campaignId": "665a1b2c3d4e5f6a7b8c9d0e",
    "donorId": "664e0a1b2c3d4e5f6a7b8c9d",
    "donationType": "Money",
    "declaredAmount": 5000,
    "status": "Verified",
    ...
  }
}
```

**Error Responses:**

| Status | Condition                                |
| ------ | ---------------------------------------- |
| 400    | Donation has already been processed      |
| 403    | NGO does not own the parent campaign     |
| 404    | Donation not found                       |
| 404    | Parent campaign not found                |
| 500    | Server error                             |

---

# 6. Validation Schemas

All mutating endpoints use Joi validation via the `validateBody(schema)` middleware.

## 6.1 createCampaignSchema

| Field                     | Rules                                    |
| ------------------------- | ---------------------------------------- |
| `title`                   | String, trimmed, 3–200 chars, required   |
| `description`             | String, trimmed, 10–2000 chars, required |
| `targetAmount`            | Number, positive, required               |
| `bankDetails`             | Object, required                         |
| `bankDetails.accountName` | String, trimmed, required                |
| `bankDetails.accountNumber`| String, trimmed, required               |
| `bankDetails.bankName`    | String, trimmed, required                |
| `bankDetails.branchName`  | String, trimmed, required                |
| `acceptedItems`           | Array of trimmed strings, optional       |

## 6.2 updateCampaignSchema

Same fields as `createCampaignSchema` but all are optional. Additionally:

| Field    | Rules                                                |
| -------- | ---------------------------------------------------- |
| `status` | String, one of `Active`, `Completed`, `Cancelled`   |

## 6.3 submitDonationSchema

| Field            | Rules                                          |
| ---------------- | ---------------------------------------------- |
| `campaignId`     | String, required                               |
| `donationType`   | String, `"Money"` or `"Supplies"`, required    |
| `declaredAmount` | Number, min 0, defaults to 0                   |
| `donorMessage`   | String, trimmed, max 500 chars, allows empty   |

> Note: `proofImage` is handled by Multer as a file upload, not validated by Joi.

## 6.4 verifyDonationSchema

| Field             | Rules                                        |
| ----------------- | -------------------------------------------- |
| `confirmedAmount` | Number, min 0, required                      |
| `status`          | String, `"Verified"` or `"Rejected"`, required |

---

# 7. Authorization & Access Control

| Endpoint                                | Roles Allowed            | Ownership Check |
| --------------------------------------- | ------------------------ | --------------- |
| `POST /api/campaigns/create`            | NGO                      | —               |
| `PUT /api/campaigns/update/:id`         | NGO                      | ✓ (ngoId)       |
| `GET /api/campaigns/active`             | Public (no auth)         | —               |
| `GET /api/campaigns/:id`               | Public (no auth)         | —               |
| `POST /api/donations/submit`            | CITIZEN, VOLUNTEER       | —               |
| `GET /api/donations/campaign/:campaignId`| NGO                     | ✓ (ngoId)       |
| `PUT /api/donations/verify/:donationId` | NGO                      | ✓ (ngoId)       |

Ownership checks are performed in the controller by comparing `campaign.ngoId` with `req.user._id`.

---

# 8. Middleware Chain

### Campaign Routes

```
POST   /create       →  protect → authorize("NGO") → validateBody(createCampaignSchema) → createCampaign
PUT    /update/:id   →  protect → authorize("NGO") → validateBody(updateCampaignSchema) → updateCampaign
GET    /active       →  getAllActiveCampaigns
GET    /:id          →  getCampaignById
```

### Donation Routes

```
POST   /submit              →  protect → authorize("CITIZEN","VOLUNTEER") → upload.single("proofImage") → validateBody(submitDonationSchema) → submitDonation
GET    /campaign/:campaignId →  protect → authorize("NGO") → getCampaignDonations
PUT    /verify/:donationId   →  protect → authorize("NGO") → validateBody(verifyDonationSchema) → verifyDonation
```

---

# 9. Error Handling

All controllers follow this pattern:

- **Success:** `{ success: true, message: "...", campaign/donation: {...} }`
- **Client Error:** `{ success: false, message: "..." }` with appropriate 4xx status
- **Server Error:** `{ success: false, message: "...", error: "<error.message>" }` with 500 status

All errors are caught in try/catch blocks and return JSON responses — no unhandled promise rejections.

---

# 10. File Structure

```
server/src/
├── controllers/
│   ├── campaignController.js      # Campaign CRUD handlers
│   └── donationController.js      # Donation submit/review/verify handlers
├── middleware/
│   └── uploadMiddleware.js        # Cloudinary + Multer config
├── models/
│   ├── Campaign.js                # Campaign Mongoose schema
│   └── Donation.js                # Donation Mongoose schema
├── routes/
│   ├── campaignRoutes.js          # Campaign route definitions
│   └── donationRoutes.js          # Donation route definitions
├── validators/
│   └── campaign.schema.js         # Joi schemas for all endpoints
└── tests/
    └── unit/
        └── campaigntests/
            ├── campaignController.test.js
            ├── donationController.test.js
            ├── campaignSchema.test.js
            └── uploadMiddleware.test.js
```

---

# 11. Workflow Summary

1. **NGO creates a campaign** with target amount, bank details, and accepted items.
2. **Citizens/Volunteers browse active campaigns** via the public endpoint.
3. **Donor submits a donation** — uploads a proof image (bank slip / supply photo) via `multipart/form-data`. Donation is created with `Pending` status.
4. **NGO reviews donations** for their campaign via the review endpoint.
5. **NGO verifies or rejects** each donation:
   - If `Verified` with `confirmedAmount > 0`, the campaign's `raisedAmount` is atomically incremented.
   - If `Rejected`, no amount changes occur.
6. **NGO marks campaign as `Completed` or `Cancelled`** when appropriate via the update endpoint.
