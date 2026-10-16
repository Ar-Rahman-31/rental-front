# DriveEase – MERN Car Rental Platform

A full‑stack car rental marketplace with separate customer & owner flows, email verification, ImageKit image storage, real‑time booking notifications, and an admin panel.

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Environment Variables](#environment-variables)
4. [Running Locally](#running-locally)
5. [Key Features](#key-features)
6. [Admin Panel](#admin-panel)
7. [Security Checklist](#security-checklist)
8. [Testing](#testing)
9. [Limitations & Future Work](#limitations--future-work)

---

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, React Router 6, Framer Motion, Axios, TanStack Query, Sonner, Lucide React, Recharts |
| Backend | Node.js 20, Express 4, Mongoose 8, JWT (httpOnly cookies), bcryptjs, Nodemailer (Gmail SMTP), Multer 2, @imagekit/nodejs 7, Socket.IO 4 |
| Database | MongoDB Atlas (free tier) |
| Real‑time | Socket.IO with JWT‑authenticated rooms |
| DevOps | Docker‑ready, free‑tier friendly (MongoDB Atlas, Render/ Railway, Vercel) |

---

## Project Structure
```
driveease/
 ├─ client/                 # Vite + React frontend
 │   ├─ src/
 │   │   ├─ components/     # UI primitives, layout, common
 │   │   ├─ hooks/          # useAuth, useCars, useBookings, useBookingNotifications
 │   │   ├─ context/        # AuthProvider (stores accessToken in memory)
 │   │   ├─ pages/          # All route components (Home, ExploreCars, CarDetail, Auth, Dashboards, Admin*)
 │   │   ├─ services/       # Axios instance + API services (auth, car, booking, socket)
 │   │   ├─ utils/          # format helpers
 │   │   ├─ routes/         # React‑Router config (AppRoutes)
 │   │   ├─ layouts/        # MainLayout (Navbar + Footer + Notification hook)
 │   │   └─ main.jsx
 │   ├─ .env.example
 │   └─ package.json
 └─ server/                 # Express + Mongoose backend
     ├─ src/
     │   ├─ config/         # db, email, imagekit
     │   ├─ controllers/    # auth, car, booking, admin
     │   ├─ middleware/     # auth (protect, restrictTo), validation, errorHandler, upload
     │   ├─ models/         # User, Car, Booking, Lock
     │   ├─ routes/         # auth, car, booking, admin
     │   ├─ jobs/           # expireBookings (cron)
     │   ├─ socket/         # initSocket (auth, rooms, events)
     │   ├─ utils/          # AppError, token, date, booking helpers
     │   ├─ app.js          # Express app factory (exports httpServer)
     │   └─ server.js       # Entry point – starts HTTP + Socket.IO
     ├─ scripts/
     │   └─ seedAdmin.js    # Creates first admin from env vars
     ├─ tests/
     │   ├─ booking.test.js
     │   ├─ admin.test.js
     │   └─ socket.test.js
     ├─ .env.example
     └─ package.json
```

---

## Environment Variables
Create `server/.env` from `server/.env.example` and `client/.env` from `client/.env.example`.

### Server (`server/.env`)
```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb+srv://<user>:<pwd>@cluster0.mongodb.net/driveease

JWT_SECRET=super_long_random_string_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=another_long_random_string
JWT_REFRESH_EXPIRES_IN=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM="DriveEase <no-reply@driveease.com>"

IMAGEKIT_PUBLIC_KEY=public_xxx
IMAGEKIT_PRIVATE_KEY=private_xxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

ADMIN_EMAIL=admin@driveease.com
ADMIN_PASSWORD=ChangeMeStrongPassword123!
```

### Client (`client/.env`)
```
VITE_API_URL=http://localhost:5000/api
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

> **Never commit real `.env` files.**  

---

## Running Locally
```bash
# 1️⃣ Backend
cd driveease/server
cp .env.example .env   # edit with your secrets
npm ci
npm run dev            # starts on http://localhost:5000 (HTTP + Socket.IO)

# 2️⃣ Frontend
cd ../client
cp .env.example .env   # ensure VITE_API_URL matches backend
npm ci
npm run dev            # starts on http://localhost:5173
```

### Create the first admin (run once)
```bash
cd driveease/server
npm run seed:admin      # uses ADMIN_EMAIL / ADMIN_PASSWORD from .env
```

---

## Key Features
| Area | Highlights |
|------|------------|
| **Authentication** | Separate customer & owner registration/login, email verification (Nodemailer + Gmail), JWT in httpOnly cookies, refresh‑token rotation, role‑based middleware (`protect`, `restrictTo`). |
| **Car Management** | Owners add/edit/delete cars, multi‑image upload via Multer → ImageKit, approval workflow (pending → approved/rejected). |
| **Search & Availability** | Full‑text search, filters (location, price, seats), pagination, date‑range availability using existing bookings (no static `isAvailable`). |
| **Booking System** | Customers create pending bookings, owners accept/reject, customers cancel (≥24 h), atomic lock (`Lock` collection) prevents double‑booking, 30‑min pending expiry job. |
| **Real‑time Notifications** | Socket.IO authenticated via JWT, per‑user rooms (`user:<id>`), events: `booking:created`, `booking:accepted`, `booking:rejected`, `booking:cancelled`, `booking:expired`. Frontend hook shows Sonner toasts & invalidates React‑Query caches. |
| **Admin Panel** | Dashboard with stats, user list (block/unblock), pending car approvals, full booking table, all protected by `admin` role. |
| **Security** | Helmet, CORS (credentials), rate‑limit, strict JWT cookie flags (`Secure`, `SameSite=Lax`), password bcrypt 12, input validation (Zod), file type/size limits, lock TTL 30 s with auto‑expiry, no secrets in frontend. |

---

## Admin Panel
* **Access** – only users with `role: "admin"` (created by `seedAdmin.js`).
* **Routes** – `/admin`, `/admin/users`, `/admin/cars`, `/admin/bookings`.
* **Capabilities**
  * View platform statistics (users, owners, cars, bookings).
  * List & filter users, block/unblock (cannot block other admins).
  * Approve / reject pending car listings.
  * Browse all bookings with status filter.
* **Creation** – run `npm run seed:admin` after setting `ADMIN_EMAIL` & `ADMIN_PASSWORD` in `.env`. No hard‑coded credentials.

---

## Security Checklist (reviewed in Stage 7)
- ✅ JWT stored only in httpOnly, `Secure` (production), `SameSite=Lax` cookies.  
- ✅ Refresh token rotated on each login; access token kept in memory.  
- ✅ `protect` middleware validates JWT, checks `isBlocked` and `isEmailVerified`.  
- ✅ `restrictTo('admin'|'owner'|'customer')` guards every endpoint.  
- ✅ Car & booking controllers verify ownership before mutating.  
- ✅ Multer accepts only `image/jpeg|png|webp`, max 5 MB, 8 files.  
- ✅ ImageKit private key never leaves server.  
- ✅ Socket.IO handshake validates same JWT; rooms limited to `user:<id>` and optional `car:<id>` (owner only).  
- ✅ Booking lock (`Lock` collection) uses unique index + 30 s TTL; released in `finally`.  
- ✅ Rate limiting (15 min / 200 req) + Helmet defaults.  
- ✅ No secrets, passwords, or tokens logged or sent to frontend.

---

## Testing
```bash
# Backend unit / integration tests
cd driveease/server
npm test   # runs booking, admin, socket suites (Jest + Supertest + mongodb‑memory‑server)

# Frontend (if Vitest/Jest configured)
cd ../client
npm test
```
Current coverage:
- Booking creation, double‑booking prevention, expiry, accept/reject/cancel, unverified‑user guard.
- Admin stats, user block/unblock, car approval/rejection, booking overview.
- Socket.IO auth, owner notification on new booking, customer notification on accept.

> **All tests must pass before promoting to next stage.**  

---

## Limitations & Future Work
| Area | Limitation |
|------|------------|
| **Lock TTL** | 30 s TTL; very long payment flows could exceed it – consider lease renewal for production. |
| **Socket durability** | Not a message queue; clients re‑fetch via REST on reconnect. |
| **Scalability** | Single‑process Socket.IO; needs Redis adapter for multi‑instance deployments. |
| **Payments** | Not implemented – architecture ready (price snapshot, status flow). |
| **Email provider** | Gmail SMTP limited to 500 day⁻¹; swap to SendGrid/Mailgun for higher volume. |
| **ImageKit free tier** | 20 GB bandwidth / month – monitor usage. |
| **Automated e2e** | Only backend integration tests; Cypress/Playwright could be added. |

---

## License
