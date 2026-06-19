# boe_landing_backend

The private API that powers the BeOnEdge **landing page** (`boe_landing`). It is
an API-only service: it never serves the public landing page itself — the
Next.js landing app does that and proxies its `/v1/*` calls here, so this backend
host stays private behind a reverse proxy.

## Highlights

- **TypeScript**, strict `tsc` build (ESM, NodeNext).
- **MongoDB** persistence via a connection **URL string** (`MONGODB_URI`) using
  the official `mongodb` driver.
- HTTP layer runs on Node's built-in `http` module (no web framework).
- Data access is isolated in `src/data/*Repository.ts` — swap the storage
  engine without touching any route code.
- Collections are auto-seeded with sample courses, plans, and accounts on first
  run (idempotent — only seeds when empty).

## Requirements

- Node.js >= 18
- A reachable MongoDB instance (local `mongod`, Docker, or MongoDB Atlas).

## Setup & commands

```bash
npm install                # installs the mongodb driver + typescript
cp .env.example .env       # set MONGODB_URI (and secrets) as needed
npm run build              # compile src -> dist with tsc
npm start                   # run the compiled server (dist/index.js)
npm run dev                 # build + start
```

On startup the server connects to `MONGODB_URI`, ensures indexes, seeds starter
data if empty, then listens on `http://127.0.0.1:47502` by default. See
`.env.example` for all configuration.

## Folder structure

Feature-based and easy to follow — each concern lives in its own folder:

```
src/
  index.ts                 entry point (starts the server)
  server.ts                http server: connect to Mongo, seed, dispatch
  routes.ts                registers every feature's routes + health
  config/
    env.ts                 environment config (PORT, MONGODB_URI, secrets)
  db/
    client.ts              MongoDB connection (URL string) + typed collections
    seed.ts                idempotent seeding of users/courses/plans
  http/
    context.ts             request context: body, cookies, query, json()
    router.ts              tiny method + ":param" path router
  middleware/
    auth.ts                resolve user from access cookie; requireAdmin
    signupKey.ts           x-signup-key gate for public signup
  lib/
    jwt.ts                 HMAC-SHA256 JWT sign/verify
    password.ts            scrypt password hashing
    id.ts                  random id generation
    validation.ts          signup + lead input validation
  data/
    userRepository.ts      MongoDB account queries
    leadRepository.ts      MongoDB lead-capture writes
    courseRepository.ts    published course catalog
    planRepository.ts      published access plans
    mappers.ts             document -> client-shape mapping
    courses.ts             course seed data
    plans.ts               plan seed data
    seedUsers.ts           account seed data (admin + demo learners)
  features/
    auth/                  signup / login / logout
    public/                public courses + plans
    admin/                 account approvals dashboard API
    onboarding/            lead-capture form endpoint
  types/
    domain.ts              shared domain types
    node-builtins.d.ts     minimal Node typings (keeps the build dependency-light)
```

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Service status (no landing page is served here) |
| GET | `/v1/health` | Health check |
| POST | `/v1/auth/signup` | Create a learner account (requires `x-signup-key`) |
| POST | `/v1/auth/login` | Sign in; sets httpOnly `access_token` + `refresh_token` cookies |
| POST | `/v1/auth/logout` | Clears the auth cookies |
| GET | `/v1/public/courses` | Published course catalog |
| GET | `/v1/public/plans` | Published access plans |
| GET | `/v1/admin/users?status=` | List learner accounts (admin only) |
| POST | `/v1/admin/users/:id/approve` | Approve an account (admin only) |
| POST | `/v1/admin/users/:id/reject` | Reject an account (admin only) |
| POST | `/v1/onboarding/applications` | Capture a learner-interest lead |

Admin routes read the `access_token` httpOnly cookie that the landing page
forwards from the browser.

## Seed accounts (development)

| Role | Login (email or username) | Password |
|---|---|---|
| Admin | `admin@beonedge.in` / `admin` | `Admin@12345` |
| Learner (pending) | `asha@example.com` / `asha_rao` | `Password123` |
| Learner (approved) | `vikram@example.com` / `vikram_s` | `Password123` |

> Seed data is inserted into MongoDB on first run (when a collection is empty).
> Drop the database to re-seed.
