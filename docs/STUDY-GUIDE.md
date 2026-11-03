# Study guide

How the assignment's requirements show up in this codebase, what to read, and
what you still have to do yourself. Read the code before you answer any
question here; the pointers are starting places, not answers.

## Where each requirement lives

| Requirement | Read | Question to answer in your own words |
| --- | --- | --- |
| Client and server roles | `apps/frontend/app/features/realtime/lib/socket.ts`, `apps/backend/src/chat/chat.gateway.ts` | What does each side own? What does the client never decide? |
| Protocol choice | `apps/backend/src/chat/chat.events.ts`, `docs/API.md` | Why WebSockets (Socket.IO) here and not raw TCP sockets? What do you gain and lose? |
| Handling many clients at once | `chat.gateway.ts` (`handleConnection`, `@SubscribeMessage` handlers) | Node is single-threaded. How does it still serve many sockets? |
| Broadcasting to all clients | `chat.gateway.ts` (`MESSAGE_SEND`), `realtime/realtime-emitter.service.ts` | How does a message reach people in the same room? Who is in a room? |
| Two or more server nodes | `docker-compose.yml`, `apps/backend/src/realtime/redis-io.adapter.ts` | Client A is on node-1, client B on node-2. Trace one message from A to B. |
| Client receives messages | `apps/frontend/app/features/realtime/hooks/use-realtime-events.ts` | Where does an incoming event end up in the UI state? |
| Server failover | `infra/traefik/dynamic/api.yml`, `apps/frontend/.../use-realtime-events.ts` (`onConnect`) | What detects a dead node? What does the client do next? |
| Message persistence | `apps/backend/prisma/schema.prisma` (`Message`), `apps/backend/src/messages/messages.service.ts` | What survives if both nodes restart? What is lost? |
| Missed messages after a drop | `apps/backend/src/messages/room-messages.controller.ts` (sync route) | How does a client catch up after reconnecting? Why an id and not a time? |
| Extras (creativity) | `apps/backend/src/auth`, `apps/backend/src/rooms`, `apps/backend/src/chat/presence.service.ts` | Which extras exist: login, direct and group rooms, presence, typing, read receipts, attachments? |

## Try these (learning exercises)

1. Run the two-node stack. Send messages between two browsers. Stop one node
   (`docs/DEPLOYMENT.md` has the steps) and watch what the clients do.
2. Follow one `message:send` through the gateway to the database and back out
   to the other client. Write the path as a list of files and functions.
3. Turn Redis off. What breaks, and for whom? Turn it back on.
4. Send the same `clientMessageId` twice. What happens, and why is that useful?

## Left for you to do

These are deliberately incomplete. They are also graded work, so they have to
be yours.

- **Load test.** `apps/backend/test/load/load-test.ts` is an empty stub. Design
  and write a test that connects many clients and sends messages at once, then
  report what you measured.
- **Known issue.** Signing in or creating an account gives no visible
  feedback, and sign-in does not always take you to the chat. Find the cause
  in `apps/frontend/app/features/auth/api/use-auth-service.ts` and the browser's
  Network tab, then fix it.
- **Report** (2 to 3 pages): your architecture, the problems you hit and how
  you solved them, how it performed and what you would improve.
- **User guide**, **code comments** and the **UI screenshot** the assignment
  asks for.
- **Make it yours.** Change something real: a feature, the protocol, the
  storage, the failover rule. Be ready to explain why.
