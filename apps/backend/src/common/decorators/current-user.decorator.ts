import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

interface IdentifiedRequest {
  user?: Record<string, unknown> | null;
}

/**
 * Extracts the identified user or one of its properties.
 * The IdentityGuard has already resolved `request.user`.
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): unknown => {
    const user = ctx.switchToHttp().getRequest<IdentifiedRequest>().user;

    if (!user) {
      throw new UnauthorizedException('Pick a username to continue');
    }

    if (data) {
      const value = user[data];

      if (value === undefined || value === null) {
        throw new UnauthorizedException(`User property "${data}" not found`);
      }

      return value;
    }

    return user;
  },
);
