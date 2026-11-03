import { Global, Module } from '@nestjs/common';
import { RealtimeEmitter } from './realtime-emitter.service.js';

@Global()
@Module({
  providers: [RealtimeEmitter],
  exports: [RealtimeEmitter],
})
export class RealtimeModule {}
