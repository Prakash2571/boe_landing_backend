# boe_landing_backend

The private API that powers the BeOnEdge **landing page** (`boe_landing`). It is
an API-only service: it never serves the public landing page itself — the
Next.js landing app does that and proxies its `/v1/*` calls here, so this backend
host stays private behind a reverse proxy.

## Highlights

- **Pure TypeScript**, **zero runtime dependencies** — runs on Node's built-in
  `http` and `crypto` modules only. No framework install required.
- Strict `tsc` build (ESM, NodeNext).
- In-memory data store seeded with sample courses, plans, and accounts — swap
  `src/data/store.ts` for a real database without touching route code.

## Commands

```bash
npm run build    # compile src -> dist with tsc
npm start         # run the compiled server (dist/index.js)
npm run dev       # build + start
```

The server listens on `http://127.0.0.1:47502` by default. See `.env.example`
for configuration.

## Folder structure

Feature-based and easy to follow — each concern lives in its own folder:

```
src/
  index.ts                 entry point (starts the server)
  server.ts                http server: CORS, body read, dispatch
  routes.ts                registers every feature's routes + health
  config/
    env.ts                 environment configuration with safe defaults
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
    store.ts               in-memory users + leads store (seeded)
    courses.ts             seed course catalog
    plans.ts               seed access plans
  features/
    auth/                  signup / login / logout
    public/                public courses + plans
    admin/                 account approvals dashboard API
    onboarding/            lead-capture form endpoint
  types/
    domain.ts              shared domain types
    node-builtins.d.ts     minimal Node typings (keeps the build dependency-free)
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

> Seed data lives in memory and resets on restart. Replace the data layer with a
> real database for production.
