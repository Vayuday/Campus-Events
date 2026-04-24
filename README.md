# Campus Event Management & Ticketing System

A centralized platform where students discover campus events, register, and
obtain digital tickets (QR codes). Organizers run approved events and scan
tickets at the door. Admins approve events, monitor registrations, generate
reports, and manage categories.

Built as an npm-workspaces monorepo with a Node.js + Express + MongoDB backend,
a React + Vite web dashboard (organizer + admin), and a React Native (Expo)
student mobile app. Notifications are mocked (stored in an in-app inbox) so the
end-to-end flow works without Firebase credentials.

## Repository layout

```
.
├── backend/   # Node.js + Express + Mongoose API (port 4000)
├── web/       # React + Vite dashboard for organizers/admins (port 5173)
├── mobile/    # React Native (Expo) app for students
├── shared/    # Shared TypeScript types (referenced by DTO shapes)
├── docker-compose.yml   # MongoDB 7 for local dev
└── package.json         # npm workspaces
```

## Prerequisites

- Node.js 20+ and npm 10+
- Expo Go on a phone, or an iOS/Android simulator, for the mobile app

**No Docker and no separate MongoDB install required.** The `npm run dev:db`
script spins up a real `mongod` on `localhost:27017` using
`mongodb-memory-server`, which downloads the official MongoDB binary once
(~100 MB, cached in `~/.cache/mongodb-binaries/`) and persists data on disk in
`./.mongo-data/`. If you'd prefer to use your own MongoDB (Docker, Homebrew,
Atlas, etc.), set `MONGO_URI` in `backend/.env` — see "Bring your own MongoDB"
below.

## 1. Install

From the repo root:

```bash
npm install
```

This installs every workspace (`backend`, `web`, `mobile`, `shared`) in one go.

## 2. Start MongoDB locally

In a dedicated terminal (keep it running):

```bash
npm run dev:db
```

You'll see `[dev-db] ready: mongodb://127.0.0.1:27017/` once mongod is up.
The first run downloads the binary; subsequent runs are instant. Data persists
across restarts in `./.mongo-data/`.

## 3. Configure environment (optional)

The defaults work out of the box (localhost:27017, port 4000, a dev JWT
secret). If you want to customize anything:

```bash
cp backend/.env.example backend/.env
```

Change `JWT_SECRET` before going anywhere near production.

## 4. Seed demo data

```bash
npm run seed
```

This clears the database and creates:

| Role      | Email                   | Password       |
|-----------|-------------------------|----------------|
| Admin     | admin@campus.edu        | Admin@123      |
| Organizer | organizer@campus.edu    | Organizer@123  |
| Organizer | organizer2@campus.edu   | Organizer@123  |
| Student   | aarav@campus.edu        | Student@123    |
| Student   | meera@campus.edu        | Student@123    |
| Student   | kiran@campus.edu        | Student@123    |

Plus 2 categories (Technical, Cultural), 5 events (4 approved, 1 pending, 1 in
the past), and a handful of registrations.

## 5. Run the three apps

In three more terminals (so four total, including `dev:db`):

```bash
npm run dev:backend    # http://localhost:4000
npm run dev:web        # http://localhost:5173
npm run dev:mobile     # Expo dev server; scan the QR or press i / a
```

### Bring your own MongoDB

If you prefer an external database, set `MONGO_URI` in `backend/.env` to your
connection string and skip `npm run dev:db`. A `docker-compose.yml` is also
included if you have Docker and want to use it:

```bash
docker compose up -d mongo   # optional alternative to `npm run dev:db`
```

The mobile app reads `EXPO_PUBLIC_API_BASE_URL` (defaults to
`http://localhost:4000/api`). On a physical device, replace `localhost` with
your computer's LAN IP, for example:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.42:4000/api npm run dev:mobile
```

## Demo walkthrough

### Student (mobile app)

1. Open the Expo app; log in as `aarav@campus.edu / Student@123`.
2. Browse upcoming events, filter by category, tap one for details.
3. Tap **Register for this event**.
4. Open **Tickets** → tap the upcoming ticket to reveal its QR code.
5. Open **Inbox** to see the mock "Registered" and "Welcome" notifications.

### Organizer (web dashboard)

1. Open <http://localhost:5173> and log in as
   `organizer@campus.edu / Organizer@123`.
2. Create a new event via **+ New event**; it lands in admin's pending queue.
3. Click **Participants** on an approved event to see the registrants table and
   download the registrations CSV.
4. Go to **Scan Tickets**, grant camera access, and scan a student's ticket QR
   (either on their device or a screenshot). The server marks the registration
   checked-in.
5. Go to **Notify**, pick an event, and send a message. Registrants receive it
   in their mobile Inbox immediately.

### Admin (web dashboard)

1. Log out and log in as `admin@campus.edu / Admin@123`.
2. **Overview** shows live totals (auto-refreshing).
3. **Pending Events** lists organizer submissions; **Approve** publishes them,
   **Reject** requires a reason (sent as a notification to the organizer).
4. **Registrations** is a monitor of approved events with fill-rate bars.
5. **Categories** lets admins CRUD categories that organizers can assign to
   events.
6. **Reports** provides CSV downloads: participation per event and activity per
   category.

## Architecture summary

- **Auth:** JWT with three roles (`student`, `organizer`, `admin`) issued by
  `/api/auth/login`. Tokens are stored in `localStorage` on web and
  `expo-secure-store` on mobile.
- **Approval workflow:** organizer-created events default to `pending`;
  admin-created events go straight to `approved`. Admin PATCHes
  `/events/:id/review` to decide.
- **Registrations:** enforced as unique per `(event, student)` and capped by
  `event.capacity`. Events in the past are closed.
- **Digital tickets:** each registration has a UUID `ticketCode`. The server
  issues a signed JWT payload `{ registrationId, ticketCode, eventId, studentId }`
  and renders it to a QR data URL. The organizer scanner POSTs the token to
  `/tickets/verify`; the server validates the signature, cross-checks the
  ticket code, and marks `checkedInAt`.
- **Notifications:** the `sendToUsers` service inserts `Notification` docs and
  logs `[MOCK FCM]` to the console. To switch to Firebase Cloud Messaging
  later, replace only that function body — no route changes needed.

## API reference (brief)

All routes are JSON and live under `/api`. Authenticated routes require
`Authorization: Bearer <jwt>`.

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /categories`, `POST /categories` *(admin)*, `PUT /categories/:id` *(admin)*, `DELETE /categories/:id` *(admin)*
- `GET /events` *(supports `?category=`, `?search=`, `?status=`, `?mine=1`)*,
  `GET /events/:id`,
  `POST /events` *(organizer/admin)*,
  `PUT /events/:id` *(organizer owns / admin)*,
  `DELETE /events/:id`,
  `PATCH /events/:id/review` *(admin)*,
  `GET /events/:id/participants` *(organizer/admin)*,
  `POST /events/:id/notify` *(organizer/admin)*
- `POST /events/:eventId/register` *(student)*,
  `DELETE /events/:eventId/register` *(student)*,
  `GET /me/registrations` *(student)* → `{ upcoming, past }`
- `GET /tickets/:registrationId` → `{ ticket: { token, qr, registration, event } }`,
  `POST /tickets/verify` *(organizer/admin)*
- `GET /notifications`, `POST /notifications/:id/read`, `POST /notifications/read-all`
- `GET /reports/summary` *(admin)*,
  `GET /reports/participation` *(admin, CSV)*,
  `GET /reports/categories` *(admin, CSV)*,
  `GET /reports/events/:id/registrations` *(organizer/admin, CSV)*

## Scripts

Root package:

- `npm run dev:db` — start a local mongod on `:27017` (no Docker needed)
- `npm run dev:backend` — run the API with ts-node + nodemon
- `npm run dev:web` — run the Vite dev server
- `npm run dev:mobile` — launch the Expo dev server
- `npm run seed` — reset + seed the database
- `npm run build:backend` — compile the backend to `backend/dist`
- `npm run build:web` — build the web dashboard to `web/dist`

## Out of scope (easy swap-ins later)

- Real Firebase Cloud Messaging (replace `sendToUsers` implementation)
- Paid tickets / payment gateway
- File upload for posters (currently just a URL string; swap for S3/Cloudinary)
