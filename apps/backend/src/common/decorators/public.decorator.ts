import { SetMetadata } from '@nestjs/common';

/** Marks a route as reachable without an `x-user-id` header. */
export const Public = () => SetMetadata('PUBLIC', true);
