import { Injectable } from '@nestjs/common';

@Injectable()
export class TypingService {
  private readonly TYPING_TTL_MS = 5_000;
  private readonly typing = new Map<string, Map<string, number>>();

  /**
   * Records a user as actively typing in a room; the entry expires on its own.
   */
  async setTyping(roomId: string, userId: string): Promise<void> {
    let users = this.typing.get(roomId);
    if (!users) {
      users = new Map();
      this.typing.set(roomId, users);
    }
    users.set(userId, Date.now() + this.TYPING_TTL_MS);
  }

  /**
   * Removes a user from typing state in a room.
   */
  async removeTyping(roomId: string, userId: string): Promise<void> {
    const users = this.typing.get(roomId);
    users?.delete(userId);
    if (users?.size === 0) this.typing.delete(roomId);
  }

  /**
   * Returns list of currently typing user IDs in a room.
   */
  async getTypingUsers(roomId: string): Promise<string[]> {
    const users = this.typing.get(roomId);
    if (!users) return [];

    const now = Date.now();
    for (const [userId, expiresAt] of users) {
      if (expiresAt <= now) users.delete(userId);
    }
    if (users.size === 0) this.typing.delete(roomId);
    return [...users.keys()];
  }
}
