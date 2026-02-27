# RescueNet User Management API (Users + Role Profiles)

This document covers backend user management for RescueNet using:
- Base `User` model (auth + common fields + role)
- Role-specific models:
  - `CitizenProfile`
  - `VolunteerProfile`
  - `NgoProfile`

RescueNet uses **cookie-based session authentication**.
Protected endpoints require `access_token` cookie.

---

## Base URL
- Local: `http://localhost:5000/api`
- Production: `https://<latter-use>/api`

---

## Authentication & Access Control
### Session
- JWT stored in **httpOnly cookie**: `access_token`
- Frontend must send credentials: `withCredentials: true`

### Role-based access (RBAC)
- `CITIZEN`: can create/update/read citizen profile
- `VOLUNTEER`: can create/update/read volunteer profile
- `NGO`: can create/update/read NGO profile
- `ADMIN`: can verify NGO/Volunteer profiles (and optionally manage users)

---

# Profile Creation Design (Two-Step)

RescueNet supports a two-step onboarding flow:
1) `User` created during registration (auth)
2) Role profile created later via **role-specific profile endpoint**

This ensures auth flow is independent from profile data.

---

# Endpoints

## A) Users (Common)

### 1) Get current session user + role profile (aggregated)
**GET** `/me`  
**Auth:** Required (any role)

**Response (200)**
```json
{
  "success": true,
  "user": {
    "_id": "65f...",
    "email": "user@example.com",
    "role": "CITIZEN"
  },
  "profile": {
    "userId": "65f...",
    "phone": "+9477...",
    "address": { "street": "...", "city": "...", "province": "..." }
  }
}
```


## B) Citizen Profile (Two-step create + update)

### 2) Create Citizen Profile

**POST** `/citizens/profile-create`  
**Auth:** Required  
**Role:** CITIZEN  

### Request Body
```json
{
  "phone": "+94761234567",
  "address": {
    "street": "123 Main Street",
    "city": "Colombo",
    "province": "Western"
  },
  "location": "Colombo 05",
  "emergencyContactName": "Nimal Perera",
  "emergencyContactPhone": "+94779876543",
  "savedShelters": []
}
```

### Response (201)
```json
{ "success": true, "message": "Citizen profile created", "profile": { ... } }
```

### Errors
- 409 Profile already exists
- 400 Validation error
- 401 Not authenticated
- 403 Not allowed role


---

### 3) Get Citizen Profile

**GET** `/citizens/profile-get`  
**Auth:** Required  
**Role:** CITIZEN  

### Response (200)
```json
{ "success": true, "profileData": { ... } }
```

### Errors
- 401 Not authenticated
- 403 Not allowed role


---

### 4) Update Citizen Profile (Single Endpoint Update)

**PATCH** `/citizens/profile-update`  
**Auth:** Required  
**Role:** CITIZEN  

### Request Body (Example)
```json
{
  "phone": "+94761234567",
  "address": {
    "street": "45 Lake Road",
    "city": "Kandy",
    "province": "Central"
  },
  "location": "Kandy Town",
  "emergencyContactName": "Nimal Perera",
  "emergencyContactPhone": "+94779876543",
  "savedShelters": ["65f1ab34c8d1234567890abc"]
}
```

### Response (200)
```json
{ "success": true, "message": "Profile updated successfully", "profile": { ... } }
```

### Errors
- 404 Profile not found
- 400 Validation error

> Note: Use `returnDocument: "after"` in Mongoose updates to return updated document.

### 5) delete citizen account + profile

**DELETE** `/citizens/profile-delete`

### Response (200)
```json
{ "success": true, "message": "Profile delete successfully"}
```

### Errors
- 404 Profile not found



---

## C) Volunteer Profile (Pattern matches Citizen)

- POST `/volunteers/profile-create` (create)
- GET `/volunteers/profile-get`
- PATCH `/volunteers/profile-update`
- PATCH `/volunteers/profile/status-update` (availability status)
- DELETE `/volunteers/profile-delete`


---

## D) NGO Profile (Pattern matches Citizen)

- POST `/ngos/profile-create` (create)
- GET `/ngos/profile-get`
- PATCH `/ngos/profile-update`
- PATCH `/ngos/profile/status-update` (availability status)
- DELETE `/ngos/profile-delete`



---

## E) Admin Verification

### Verify Volunteer Profile

**PATCH** `/admin/verify-volunteer/:userId`  
**Auth:** Required  
**Role:** ADMIN  

### Response (200)
```json
{ "success": true, "message": "Volunteer verified", "profile": { ... } }
```


### Verify NGO Profile

**PATCH** `/admin/verify-ngo/:userId`  
**Auth:** Required  
**Role:** ADMIN  

### Response (200)
```json
{ "success": true, "message": "NGO verified", "profile": { ... } }
```


---

# Validation Rules (Joi)

## Citizen Profile Create / Update

- `phone`: required (create), optional (update)
- `address`: object (street, city, province) required (create)
- `emergencyContactName`: required (create)
- `emergencyContactPhone`: required (create)
- `savedShelters`: array of MongoDB ObjectId strings (optional)


---

# Testing Guide (Unit Tests Only)

Recommended unit testing scope:

## citizenProfileController
- create success
- create conflict (profile exists)
- update success
- update not found

## userController.getMe
- returns correct profile based on role
- returns profile null if not created

## adminUserController
- verify volunteer success
- verify NGO success
- invalid role userId returns 400


---

# Common Issues

## Address Validation Error

If you see:
```
"address" must be a string
```

Your Joi schema is wrong. `address` must be validated as an object.

Correct Joi example:

```js
address: Joi.object({
  street: Joi.string().required(),
  city: Joi.string().required(),
  province: Joi.string().required()
}).required()
```


---

## Mongoose Deprecation Warning

If you see warning for:
```
new: true
```

Replace with:
```js
{ returnDocument: "after" }
```

