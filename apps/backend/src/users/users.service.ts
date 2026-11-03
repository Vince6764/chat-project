import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  MeResponse,
  UserProfileResponse,
  UserSummaryResponse,
} from './dto/user.response.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';
import type { SearchUsersQueryDto } from './dto/search-users-query.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds the user with this name (case-insensitive) or creates it.
   */
  async join(name: string): Promise<MeResponse> {
    const existing = await this.prisma.user.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (existing) return this.toMeResponse(existing);

    try {
      const user = await this.prisma.user.create({
        data: { id: randomUUID(), name },
      });
      return this.toMeResponse(user);
    } catch (err) {
      const raced = await this.prisma.user.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
      });
      if (raced) return this.toMeResponse(raced);
      throw err;
    }
  }

  /**
   * Retrieves the current user's profile.
   */
  async getMe(userId: string): Promise<MeResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.toMeResponse(user);
  }

  /**
   * Updates display name and/or avatar image for the current user.
   */
  async updateMe(userId: string, dto: UpdateProfileDto): Promise<MeResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.image !== undefined && { image: dto.image }),
      },
    });

    return this.toMeResponse(updatedUser);
  }

  /**
   * Searches users by name prefix or substring.
   */
  async searchUsers(
    userId: string,
    query: SearchUsersQueryDto,
  ): Promise<UserSummaryResponse[]> {
    const limit = query.limit ?? 10;
    const q = query.q?.trim();

    const users = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      },
      take: limit,
      select: {
        id: true,
        name: true,
        image: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      image: u.image,
    }));
  }

  /**
   * Retrieves the public profile for a specific user ID.
   */
  async getUserProfile(targetUserId: string): Promise<UserProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${targetUserId} not found`);
    }

    return {
      id: user.id,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private toMeResponse(user: {
    id: string;
    name: string;
    image: string | null;
    createdAt: Date;
  }): MeResponse {
    return {
      id: user.id,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
