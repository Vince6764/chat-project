import 'dotenv/config';
import dns from 'node:dns';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmetModule from 'helmet';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module.js';
import { createPingHandler } from './health/ping.handler.js';
import { PrismaService } from './prisma/prisma.service.js';
import { corsOriginCallback } from './common/utils/cors.util.js';

type HelmetFn = (
  options?: Record<string, unknown>,
) => (req: Request, res: Response, next: NextFunction) => void;

// helmet's typings and runtime export differ under ESM, so resolve it safely.
const helmet = ((helmetModule as any).default ??
  (helmetModule as any).helmet ??
  helmetModule) as HelmetFn;

dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Behind a reverse proxy (e.g. Vercel, Render)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // Enable graceful shutdown hooks for container lifecycle
  app.enableShutdownHooks();

  // Security headers: relax CSP on Swagger UI docs
  app.use((req: Request, res: Response, next: NextFunction) => {
    const path = req.path || req.url || '';
    if (path.startsWith('/api/docs') || path.startsWith('/docs')) {
      return helmet({
        contentSecurityPolicy: false,
      })(req, res, next);
    }
    return helmet()(req, res, next);
  });

  // Before enableCors(): CORS would answer OPTIONS /ping without hitting the DB.
  app.use('/ping', createPingHandler(app.get(PrismaService)));
  app.enableCors({
    origin: corsOriginCallback,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'x-user-id',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['X-Node-Id'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Relay Chat API')
    .setDescription(
      'Distributed real-time chat application API documentation, schemas, and contract placeholders.',
    )
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-user-id',
        in: 'header',
        description: 'Id returned by POST /api/users/join',
      },
      'user-id',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(
    `Server running on port ${port}. Swagger UI available at /api/docs`,
  );
}
await bootstrap();
