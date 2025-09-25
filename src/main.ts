import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ENV } from './config/env.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // Настройка CORS для SSE
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Cache-Control',
  });

  const port = parseInt(ENV.PORT);
  await app.listen(port);

  logger.log(`🚀 SSE Emulator запущен на порту ${port}`);
  logger.log(`📡 SSE эндпоинт: http://localhost:${port}/sse/stream`);
  logger.log(`📊 Статус сервиса: http://localhost:${port}/sse/status`);
}
bootstrap();
