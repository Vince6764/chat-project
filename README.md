# Relay Chat (reference implementation)

A real-time chat on a single NestJS + Socket.IO node, with Postgres keeping
history. There are no accounts: you pick a username and start chatting.

**This is study material, not a submission.** Read it, run it, break it, then
build your own version and write your own report. Anything you hand in must be
work you can explain line by line. Start with [`docs/STUDY-GUIDE.md`](docs/STUDY-GUIDE.md).

```
client ──> API node (REST + Socket.IO) ──> Postgres (message history)
```

## Layout

| Path | What it is |
| --- | --- |
| `apps/backend` | NestJS API and Socket.IO gateway (username identity, Prisma) |
| `apps/frontend` | React Router single-page client (SPA mode) |
| `docker-compose.yml` | The backend as a container (optional) |
| `docs/API.md` | HTTP and WebSocket contract |
| `docs/STUDY-GUIDE.md` | Where each requirement lives in the code |

---

## Environment variables

Each app has its own environment. Nothing is shared between them except the two
URLs that point at each other.

### Backend (`apps/backend/.env`)

| Variable | Required | Example | What it does and where to get it |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require` | Connection string the app uses at runtime. In [Neon](https://console.neon.tech): open your project, click **Connect**, turn **Connection pooling** on and copy the string (the host contains `-pooler`). Any Postgres works; the app always connects over TLS. It is also needed at **install time**, because `prisma generate` loads `prisma.config.ts`. |
| `DIRECT_URL` | For migrations | `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require` | Non-pooled connection string used by `prisma migrate deploy`. In Neon, click **Connect** and turn **Connection pooling** off. Falls back to `DATABASE_URL` if unset. |
| `FRONTEND_URLS` | Yes in production | `https://relay-chat.vercel.app` | Comma-separated list of browser origins allowed by CORS and Socket.IO. Use the exact origin of your deployed frontend: scheme and host, no path, no trailing slash. Startup fails in production if both this and `FRONTEND_URL` are empty. |
| `FRONTEND_URL` | No | `https://relay-chat.vercel.app` | Single-origin fallback used when `FRONTEND_URLS` is not set. |
| `NODE_ENV` | No | `production` | `production` makes the CORS list strict (no localhost defaults). Vercel and Render set it for you. |
| `PORT` | No | `3000` | Port the server listens on. Defaults to `3000`. Vercel and Render provide it, so do not set it there. |
| `NODE_ID` | No | `node-1` | Label returned in the `X-Node-Id` header, `/health/node` and the logs. Defaults to `node-1`. |

### Frontend (`apps/frontend/.env`)

| Variable | Required | Example | What it does and where to get it |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | `https://relay-api.vercel.app` | Public URL of the deployed backend (no trailing slash). It is baked into the bundle at build time, so changing it needs a redeploy. Defaults to `http://localhost:3000`. |

Only variables that start with `VITE_` reach the browser. Never put secrets in them.

---

## Run it locally

1. Backend:
   ```bash
   cd apps/backend
   cp .env.example .env        # fill in DATABASE_URL and DIRECT_URL
   pnpm install                # also runs `prisma generate`
   pnpm prisma:deploy          # applies the migrations
   pnpm start:dev              # http://localhost:3000, docs at /api/docs
   ```
2. Frontend:
   ```bash
   cd apps/frontend
   cp .env.example .env        # VITE_API_BASE_URL=http://localhost:3000
   pnpm install
   pnpm dev                    # http://localhost:5173
   ```
3. Optional: run the backend as a container with `docker compose up -d --build`
   (reads `apps/backend/.env`, serves on port 3000).

Check it: `curl localhost:3000/health/ready` returns `{"status":"ok",...}`.

---

## Deploy on Vercel

Both apps live in one repository, so create **two Vercel projects** from the
same Git repo, one per app, each with its own **Root Directory**. Deploy the
backend first because the frontend needs its URL.

### 0. Database (once)

1. Create a Postgres database (for example a free [Neon](https://neon.tech) project, or add Neon from the Vercel Marketplace).
2. Copy the pooled string for `DATABASE_URL` and the direct string for `DIRECT_URL` (see the table above).
3. Apply the migrations from your machine. Vercel builds do not run them:
   ```bash
   cd apps/backend
   DATABASE_URL="<pooled>" DIRECT_URL="<direct>" pnpm prisma:deploy
   ```
   Run this again whenever you add a migration under `apps/backend/prisma/migrations`.

### 1. Backend project (NestJS)

Vercel supports NestJS with no configuration: it finds `src/main.ts`, compiles
it and runs the whole app as one Vercel Function on Fluid compute.

1. [vercel.com/new](https://vercel.com/new), import the repository.
2. Set **Root Directory** to `apps/backend`. The framework is detected as **NestJS**. Leave the build and output settings alone.
3. Add these **Environment Variables** (Production, and Preview if you use it):
   - `DATABASE_URL` (needed at build time too, for `prisma generate`)
   - `FRONTEND_URLS`: put a placeholder such as `http://localhost:5173` for now and fix it in step 3 below
4. Click **Deploy**. Note the production URL, for example `https://relay-api.vercel.app`.
5. Check `https://relay-api.vercel.app/health/ready` (expect `{"status":"ok","checks":{"database":"up"}}`) and `/api/docs`.

`DIRECT_URL` is only for migrations from your machine, so the project does not need it. Node.js 20 or newer is required.

### 2. Frontend project (React Router SPA)

1. Import the same repository again as a second project.
2. Set **Root Directory** to `apps/frontend`. The preset is detected as **React Router** or **Vite**.
3. Add the **Environment Variable** `VITE_API_BASE_URL` = the backend URL from the previous step.
4. Click **Deploy**. `apps/frontend/vercel.json` serves `build/client` and rewrites every path to `index.html`, so deep links such as `/chat/<id>` and a page refresh work.

### 3. Connect them (CORS)

1. In the **backend** project, set `FRONTEND_URLS` to the frontend's production origin, for example `https://relay-chat.vercel.app`. Add custom domains and preview URLs to the list, comma-separated, if you use them.
2. **Redeploy the backend** (Deployments, then Redeploy) so the new value is loaded.
3. Open the frontend, pick a username and send a message from two browsers.

### Realtime limits on Vercel

Socket.IO needs long-lived WebSocket connections. Vercel Functions support
WebSockets (generally available, Fluid compute required, all plans), with
limits that matter for this app:

- **Not verified for NestJS.** Vercel documents WebSockets for Express, Hono, Next.js and others, but its NestJS pages say nothing about `@WebSocketGateway`. Deploy, then test sending a message between two browsers before relying on it. Check the browser's Network tab (WS filter) for a connection to `/socket.io/`.
- **No shared state between instances.** A connection is pinned to one function instance, and instances share no memory. This app keeps presence, typing state, rate limits and room broadcasts in memory, so when Vercel runs more than one instance, users connected to different instances will not see each other's live messages (history still loads from Postgres).
- **Connections are cut at the function's max duration** (300 s on Hobby, up to 800 s on Pro). The client reconnects on its own and catches up from the sync endpoint.
- Presence and typing reset whenever an instance restarts.

If live messages are unreliable, keep the frontend on Vercel and run the
backend as a **single instance** on a host with long-lived processes (Render,
Railway or Fly), using the `Dockerfile` in `apps/backend`. Set the same
backend variables there and point `VITE_API_BASE_URL` at that URL.

---

## Troubleshooting

- **CORS errors in the browser console**: `FRONTEND_URLS` does not exactly match the frontend origin (scheme, host, no trailing slash), or the backend was not redeployed after changing it.
- **Backend build fails at `prisma generate`**: `DATABASE_URL` is missing from the Vercel project's environment variables.
- **`/health/ready` returns 503**: the database is unreachable. Check `DATABASE_URL` and that migrations were applied.
- **`401 Unknown user` after resetting the database**: the browser still holds an old user id. The app sends you back to the join page; pick a username again.
- **Refreshing `/chat/...` gives a 404 on Vercel**: `apps/frontend/vercel.json` was not picked up. Confirm the Root Directory is `apps/frontend`.
- **Frontend still calls `localhost:3000`**: `VITE_API_BASE_URL` was set after the build. Set it, then redeploy.
