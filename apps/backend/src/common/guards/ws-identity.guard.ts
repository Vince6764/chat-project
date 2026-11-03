import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { resolveSocketUser, type SocketUser } from '../utils/socket-user.util.js';

@Injectable()
export class WsIdentityGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    if (!client) {
      throw new WsException('Invalid socket context');
    }

    let user = (client.data as { user?: SocketUser })?.user;
    if (!user) {
      user = (await resolveSocketUser(client)) ?? undefined;
      if (user) {
        client.data.user = user;
      }
    }

    if (!user?.id) {
      throw new WsException('Unauthorized: a known user id is required');
    }

    return true;
  }
}
