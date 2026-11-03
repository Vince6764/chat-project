import { Global, Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-exceptions.filter.js';
import { LoggingInterceptor } from './interceptors/logging.interceptor.js';
import { TransformResponseInterceptor } from './interceptors/transform-response.interceptor.js';
import { IdentityGuard } from './guards/identity.guard.js';
import { RoomMemberGuard } from './guards/room-member.guard.js';
import { RoomAdminGuard } from './guards/room-admin.guard.js';
import { RoomOwnerGuard } from './guards/room-owner.guard.js';
import { WsIdentityGuard } from './guards/ws-identity.guard.js';
import { WsThrottleGuard } from './guards/ws-throttle.guard.js';

@Global()
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: IdentityGuard,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    IdentityGuard,
    RoomMemberGuard,
    RoomAdminGuard,
    RoomOwnerGuard,
    WsIdentityGuard,
    WsThrottleGuard,
  ],
  exports: [
    IdentityGuard,
    RoomMemberGuard,
    RoomAdminGuard,
    RoomOwnerGuard,
    WsIdentityGuard,
    WsThrottleGuard,
  ],
})
export class CommonModule {}
