# RescueNet Authentication API (Cookie Session + OTP)

This document provides **complete** documentation for RescueNet authentication, including:
- Register / Login / Logout / Session (Me)
- Account Verification OTP
- Password Reset OTP
- Validation rules (recommended)
- Cookie/session setup (separate frontend + backend deployment)
- Postman setup and testing notes

---

## Base URL

- Local: `http://localhost:5000/api`
- Production: `https://<later-add>/api`

In Postman, we use:
- `{{baseUrl}}` (example: `http://localhost:5000/api`)

---

## Authentication & Session Management (JWT in httpOnly Cookie)

RescueNet uses **JWT stored in an httpOnly cookie** named:

- Cookie name: `access_token`

### How it works
1. User registers or logs in
2. Backend generates JWT and returns it via `Set-Cookie`
3. Browser/Postman automatically stores cookie
4. Subsequent requests include cookie automatically
5. Protected routes verify the cookie token

### Why cookie-based session?
- Token is **not accessible** via JS (`httpOnly`)
- More secure than localStorage for XSS scenarios
- Works well for “session management” requirement in MERN

---

## CORS Requirements (Important)

Because your frontend and backend are deployed separately, you must enable credentials:

### Backend (Express CORS)
- `credentials: true`
- `origin: <frontend-url>`

### Frontend (Axios)
- `withCredentials: true`

If these are not set, cookie login will not work.

---

## Cookie Settings (Development vs Production)

| Environment | secure | sameSite | Notes |
|------------|--------|----------|------|
| Development | `false` | `"lax"` | Works on localhost |
| Production (FE & BE different domains) | `true` | `"none"` | Requires HTTPS |

Recommended cookie options:
- `httpOnly: true`
- `maxAge: 7 days` (or suitable)

---

## Roles (RBAC)

RescueNet supports role-based access:

- `ADMIN`
- `VOLUNTEER`
- `NGO`
- `CITIZEN` (optional)

Typically:
- Public users (citizens) can access shelters/alerts without login for emergencies.
- Admin/Volunteer can access protected routes to add/manage shelters.

---

## Response Format (Recommended)

Success example:
```json
{
  "message": "Logged in",
  "user": {
    "id": "65fxxxxxxxxxxxx",
    "name": "A.M Gihan",
    "email": "gihan@example.com",
    "role": "ADMIN"
  }
}

---

# Authentication Module Details

## 1️⃣ Endpoints (Register → Reset Password)


## 1. Register

**POST** `/auth/register`

Creates a new user and starts a session by setting an `access_token`
cookie.

### Request Body

``` json
{
  "name": "A.M Gihan",
  "email": "gihan@example.com",
  "password": "StrongPass123!",
  "role": "ADMIN"
}
```

### Success Response (201)

``` json
{
  "message": "Registered",
  "user": {
    "id": "65fxxxxxxxx",
    "name": "A.M Gihan",
    "email": "gihan@example.com",
    "role": "ADMIN"
  }
}
```

### Errors

-   400 -- Validation error
-   409 -- Email already exists

------------------------------------------------------------------------

## 2. Login

**POST** `/auth/login`

Authenticates user and sets `access_token` cookie.

### Request Body

``` json
{
  "email": "gihan@example.com",
  "password": "StrongPass123!"
}
```

### Success Response (200)

``` json
{
  "message": "Logged in",
  "user": {
    "id": "65fxxxxxxxx",
    "name": "A.M Gihan",
    "email": "gihan@example.com",
    "role": "ADMIN"
  }
}
```

### Errors

-   400 -- Validation error
-   401 -- Invalid credentials

------------------------------------------------------------------------

## 3. Logout

**POST** `/auth/logout`

Clears authentication cookie.

### Success Response

``` json
{
  "message": "Logged out"
}
```

------------------------------------------------------------------------

## 4. Get Current User (Session Check)

**GET** `/auth/me`

Returns authenticated user using cookie session.

### Success Response

``` json
{
  "user": {
    "_id": "65fxxxxxxxx",
    "name": "A.M Gihan",
    "email": "gihan@example.com",
    "role": "ADMIN"
  }
}
```

### Errors

-   401 -- Not authenticated

------------------------------------------------------------------------

# Account Verification (OTP)

## 5. Send OTP

**POST** `/auth/send-otp`

Sends 6-digit verification OTP to email.

### Request Body

``` json
{
  "no need to pass anything-cookie send data"
}
```

### Success Response

``` json
{
  "message": "OTP sent"
}
```

------------------------------------------------------------------------

## 6. Verify Account

**POST** `/auth/verify-account`

Verifies account using OTP.

### Request Body

``` json
{
  "otp": "123456"
}
```

### Success Response

``` json
{
  "message": "Account verified"
}
```

### Errors

-   400 -- Invalid or expired OTP

------------------------------------------------------------------------

# Password Reset Flow

## 7. Send Reset OTP

**POST** `/auth/send-reset-otp`

Sends OTP for password reset.

### Request Body

``` json
{
  "email": "gihan@example.com"
}
```

------------------------------------------------------------------------

## 8. Verify Reset OTP (Optional)

**POST** `/auth/verify-reset-otp`

Validates reset OTP.

### Request Body

``` json
{
  "email": "gihan@example.com",
  "otp": "123456"
}
```

------------------------------------------------------------------------

## 9. Reset Password

**POST** `/auth/reset-password`

Resets password after OTP validation.

### Request Body

``` json
{
  "email": "gihan@example.com",
  "newPassword": "NewStrongPass123!"
}
```

### Success Response

``` json
{
  "message": "Password reset successful"
}
```

### Errors

-   400 -- Invalid OTP
-   404 -- User not found

------------------------------------------------------------------------

# Validation Rules

## Register

-   name: max 60 characters
-   email: valid email format
-   password: 8--64 characters
-   role: must be one of allowed roles

## Login

-   email: required, valid email
-   password: required

## OTP Endpoints

-   email: valid email
-   otp: exactly 6 numeric digits

## Reset Password

-   email: valid email
-   otp: 6-digit numeric code
-   newPassword: minimum 8 characters

------------------------------------------------------------------------

# Testing Guide

## Postman Testing Sequence

1.  Register OR Login
2.  Check `/auth/me` → should return user
3.  Logout
4.  Check `/auth/me` → should return 401

## OTP Testing

1.  Send OTP
2.  Check email inbox
3.  Verify Account with OTP

## Reset Password Testing

1.  Send Reset OTP
2.  Copy OTP from email
3.  Reset Password using OTP
4.  Login with new password

------------------------------------------------------------------------

# Common Issues

## Cookies not working

-   Backend must enable:
    -   `credentials: true`
    -   Proper `origin`
-   Frontend must use:
    -   `withCredentials: true`

## Production cookie issues

-   Must use HTTPS
-   Cookie must have:
    -   `secure: true`
    -   `sameSite: "none"`

## Invalid token errors

-   Token expired
-   Wrong JWT_SECRET
-   Cookie not sent from frontend

------------------------------------------------------------------------

# Security Recommendations

-   Use httpOnly cookies
-   Use secure + sameSite settings correctly
-   Hash passwords with bcrypt
-   Hash OTP before storing in DB
-   Add OTP expiry (5--10 minutes)
-   Rate-limit OTP endpoints
-   Add login attempt throttling
-   Use Helmet middleware
-   Centralized error handling

------------------------------------------------------------------------

# Related Files Reference

Authentication-related backend files:

-   `server/src/routes/authRoutes.js`
-   `server/src/controllers/authController.js`
-   `server/src/middleware/auth.js`
-   `server/src/middleware/authorize.js`
-   `server/src/middleware/validate.js`
-   `server/src/services/passwordService.js`
-   `server/src/config/nodeMailer.js`
-   `server/src/models/User.js`
-   `server/src/validators/auth.schema.js`

Documentation files:

-   `docs/auth/auth.md`
-   `docs/auth/Postman_Collection.json`



