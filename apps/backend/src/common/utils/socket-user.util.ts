import type { Socket } from 'socket.io';
import { prisma } from '../../prisma/prisma.client.js';

export interface SocketUser {
  id: string;
  name: string;
  image: string | null;
}

/**
 * Resolves the user behind a Socket.IO connection from `auth.userId` in the
 * handshake (or the `x-user-id` header). Returns null for unknown ids.
 */
export async function resolveSocketUser(
  client: Socket,
): Promise<SocketUser | null> {
  const fromAuth = (client.handshake?.auth as { userId?: string } | undefined)
    ?.userId;
  const header = client.handshake?.headers?.['x-user-id'];
  const raw = fromAuth ?? (Array.isArray(header) ? header[0] : header);

  if (typeof raw !== 'string' || raw.trim().length === 0) return null;

  try {
    return await prisma.user.findUnique({
      where: { id: raw.trim() },
      select: { id: true, name: true, image: true },
    });
  } catch {
    return null;
  }
}
