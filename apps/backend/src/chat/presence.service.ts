import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { PresenceSnapshot, UserPresence } from './dto/presence.response.js';

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private readonly HEARTBEAT_TTL_MS = 60_000; // 60 seconds heartbeat expiry

  /** userId -> (socketId -> last heartbeat timestamp) */
  private readonly connections = new Map<string, Map<string, number>>();

  constructor(private readonly prisma: PrismaService) {}

  private activeSockets(userId: string): Map<string, number> | undefined {
    const sockets = this.connections.get(userId);
    if (!sockets) return undefined;

    const threshold = Date.now() - this.HEARTBEAT_TTL_MS;
    for (const [socketId, seenAt] of sockets) {
      if (seenAt < threshold) sockets.delete(socketId);
    }
    if (sockets.size === 0) {
      this.connections.delete(userId);
      return undefined;
    }
    return sockets;
  }

  /**
   * Registers an active socket connection for a user.
   * Returns true if this is the user's first connection (transitioned from offline to online).
   */
  async addConnection(userId: string, socketId: string): Promise<boolean> {
    const wasOffline = !this.activeSockets(userId);
    const sockets = this.connections.get(userId) ?? new Map<string, number>();
    sockets.set(socketId, Date.now());
    this.connections.set(userId, sockets);
    return wasOffline;
  }

  /**
   * Unregisters a socket connection for a user.
   * Returns true if user has no remaining active connections (transitioned to offline).
   */
  async removeConnection(
    userId: string,
    socketId: string,
  ): Promise<{ wasLast: boolean; lastSeenAt: string }> {
    const lastSeenAt = new Date().toISOString();

    this.connections.get(userId)?.delete(socketId);
    if (this.activeSockets(userId)) {
      return { wasLast: false, lastSeenAt };
    }

    await this.prisma.user
      .update({
        where: { id: userId },
        data: { lastSeenAt: new Date(lastSeenAt) },
      })
      .catch((err) =>
        this.logger.warn(`Failed to update lastSeenAt for user ${userId}: ${err.message}`),
      );

    return { wasLast: true, lastSeenAt };
  }

  /**
   * Refreshes the heartbeat timestamp for an active socket.
   */
  async heartbeat(userId: string, socketId: string): Promise<void> {
    const sockets = this.connections.get(userId) ?? new Map<string, number>();
    sockets.set(socketId, Date.now());
    this.connections.set(userId, sockets);
  }

  /**
   * Retrieves online presence and last seen timestamps for the requested user IDs.
   */
  async getPresence(
    userId: string,
    targetUserIds: string[],
  ): Promise<PresenceSnapshot> {
    const presence: Record<string, UserPresence> = {};
    if (!targetUserIds.length) {
      return { presence };
    }

    const uniqueIds = Array.from(new Set(targetUserIds));
    const offlineIds: string[] = [];

    for (const id of uniqueIds) {
      if (id === userId || this.activeSockets(id)) {
        presence[id] = { online: true, lastSeenAt: null };
      } else {
        offlineIds.push(id);
      }
    }

    // For offline users, fetch real lastSeenAt from Postgres
    if (offlineIds.length > 0) {
      try {
        const users = await this.prisma.user.findMany({
          where: { id: { in: offlineIds } },
          select: { id: true, lastSeenAt: true },
        });

        const userMap = new Map(users.map((u) => [u.id, u.lastSeenAt]));

        for (const id of offlineIds) {
          const lastSeen = userMap.get(id);
          presence[id] = {
            online: false,
            lastSeenAt: lastSeen ? lastSeen.toISOString() : null,
          };
        }
      } catch (err: any) {
        this.logger.warn(`Failed to fetch lastSeenAt from database: ${err.message}`);
        for (const id of offlineIds) {
          presence[id] = {
            online: false,
            lastSeenAt: null,
          };
        }
      }
    }

    return { presence };
  }
}
