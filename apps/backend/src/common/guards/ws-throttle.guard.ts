import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import type { SocketUser } from '../utils/socket-user.util.js';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

@Injectable()
export class WsThrottleGuard implements CanActivate {
  private readonly clients = new Map<string, RateLimitRecord>();
  private readonly limit = 30; // Max events per window
  private readonly windowSeconds = 5; // 5 seconds window

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const userId = (client?.data as { user?: SocketUser } | undefined)?.user?.id;
    const identifier = userId ? `user:${userId}` : `socket:${client?.id ?? 'unknown'}`;
    const now = Date.now();
    for (const [id, rec] of this.clients.entries()) {
      if (now > rec.resetAt) {
        this.clients.delete(id);
      }
    }

    const record = this.clients.get(identifier);
    if (!record || now > record.resetAt) {
      this.clients.set(identifier, { count: 1, resetAt: now + this.windowSeconds * 1000 });
      return true;
    }

    record.count += 1;
    if (record.count > this.limit) {
      throw new WsException('Rate limit exceeded: Too many messages, please slow down.');
    }

    return true;
  }
}
