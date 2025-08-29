# multi-factor-auth

> Production-minded Two-Factor Authentication (2FA / MFA) example using **Node.js**, **Express**, **Passport.js**, **Speakeasy** and **MongoDB**.

---

## 🚀 Project Summary

`multi-factor-auth` demonstrates a practical, session-based authentication flow augmented with Time-based One-Time Password (TOTP) 2FA. The project pairs a traditional username/password (handled with Passport `local` strategy) with an authenticator-app second factor (Google Authenticator, Authy, etc.). It includes setup, verification, reset, and a JWT returned after successful 2FA verification for API usage.

This repository is ideal as a learning resource or a foundation for production systems (apply recommended hardening before production).

---

## 🧭 What this repo contains

* Express server (`src/index.js`) with session support and Passport initialization.
* MongoDB connection utility (`src/config/dbConnect.js`).
* Passport configuration using `passport-local` (`src/config/passportConfig.js`) with `serializeUser`/`deserializeUser`.
* `User` Mongoose model with `username`, `password`, `isMfaActive`, and `twoFactorSecret`.
* Auth routes and controllers implementing registration, login, logout, auth status, and 2FA setup/verify/reset flows.

---

## 🛠️ Tech stack & deps

* Node.js + Express
* Passport.js (passport-local)
* Mongoose + MongoDB Atlas
* Speakeasy (TOTP)
* qrcode (QR generation)
* bcryptjs (password hashing)
* express-session (session handling)
* jsonwebtoken (JWT issuance after 2FA)

---



## 🔌 How it works (high-level)

1. **Register** (`POST /api/auth/register`) — password is hashed with `bcrypt` and a new user document is created (`isMfaActive` defaults to `false`).
2. **Login** (`POST /api/auth/login`) — authenticated via Passport `local` strategy (username/password). If credentials match, `req.user` is populated and a session is established.
3. **2FA Setup** (`POST /api/auth/2fa/setup`) — authenticated users can call this to generate a Speakeasy secret which is saved to `user.twoFactorSecret` and `isMfaActive` is set to `true`. The endpoint returns a `secret` and a `qrCode` (Data URL) to scan with an authenticator app.
4. **2FA Verify** (`POST /api/auth/2fa/verify`) — client submits the TOTP token. Server verifies via Speakeasy; on success it issues a JWT signed with `JWT_SECRET` (expires in 1 hour).
5. **2FA Reset** (`POST /api/auth/2fa/reset`) — authenticated route that clears `twoFactorSecret` and disables `isMfaActive`.
6. **Auth Status** (`GET /api/auth/status`) — returns current session username and whether 2FA is active.
7. **Logout** (`POST /api/auth/logout`) — calls `req.logout()` and ends the session.

---

## 📬 API Endpoints (summary)

All routes are prefixed with `/api/auth` in the running server.

### Public

* `POST /api/auth/register` — register with `{ username, password }`
* `POST /api/auth/login` — login (passport-local). The Passport middleware authenticates and then `login` controller responds with `{ isMfaActive }`.
* `GET /api/auth/status` — check if there's an authenticated session and whether 2FA is enabled.
* `POST /api/auth/logout` — logout and destroy session.

### Protected (requires session `req.isAuthenticated()`)

* `POST /api/auth/2fa/setup` — generate & save TOTP secret, returns `{ secret, qrCode }`.
* `POST /api/auth/2fa/verify` — verify TOTP: body `{ token }`. On success returns `{ token: <JWT>, message: '2FA Successful' }`.
* `POST /api/auth/2fa/reset` — disable 2FA and clear saved secret.

---

## 🔎 Important implementation details

* **Passport Local Strategy** (`src/config/passportConfig.js`) searches user by `username` and compares hashed password with `bcrypt.compare`.
* **Session handling** uses `express-session` with the cookie `maxAge` set to `60 minutes` in `src/index.js`.
* **2FA secret storage**: the application stores the Speakeasy `base32` secret in `user.twoFactorSecret`. For production, encrypt this or store secrets in a KMS — do **not** leave raw secrets in the DB.
* **QR generation**: `qrcode.toDataURL(otpauthUrl)` returns a Data URI that can be rendered on the client for scanning.
* **JWT after 2FA**: after successful `verify2FA`, a JWT is issued using `jsonwebtoken` and `process.env.JWT_SECRET`. This token can be used for API auth in stateless flows.

---

## ✅ Testing & debugging tips

* Use Postman or Thunder Client to run the sequence: **register → login → 2fa/setup → scan QR → 2fa/verify**.
* Check server logs for `serializeUser` / `deserializeUser` outputs to debug session lifecycle.
* Test with a time-synced device or allow a verification window to handle clock drift.

---
