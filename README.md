# Relay Chat (reference implementation)

A real-time chat that runs on two server nodes behind Traefik, with Redis
relaying messages between nodes and Postgres keeping history.

**This is study material, not a submission.** Read it, run it, break it, then
build your own version and write your own report. Anything you hand in must be
work you can explain line by line. Start with [`docs/STUDY-GUIDE.md`](docs/STUDY-GUIDE.md).

```
client ──> Traefik ──┬──> node-1 ─┐
                     └──> node-2 ─┼──> Redis (relays events between nodes)
                                  └──> Postgres (message history)
```

## Layout

| Path | What it is |
| --- | --- |
| `apps/backend` | NestJS API and Socket.IO gateway (Better Auth sessions, Prisma) |
| `apps/frontend` | React Router single-page client |
| `infra/traefik` | Load balancer config: health checks and routing to both nodes |
| `docker-compose.yml` | Redis, two backend nodes, Traefik |
| `docs/API.md` | HTTP and WebSocket contract |
| `docs/DEPLOYMENT.md` | Running the two-node stack and the failover demo |

## Run it

1. Backend: copy `apps/backend/.env.example` to `apps/backend/.env`, set
   `DATABASE_URL`, then `pnpm install && pnpm prisma migrate deploy`.
2. Two nodes and Traefik: `docker compose up -d --build` (see `docs/DEPLOYMENT.md`).
3. Frontend: `cd apps/frontend && cp .env.example .env && pnpm install && pnpm dev`.
   Set `VITE_API_BASE_URL` to the Traefik address from the deployment guide.
