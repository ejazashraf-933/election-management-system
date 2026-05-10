import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggingInterceptor } from './common/logging.interceptor';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const expressServer = express();
let nestBootstrap: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressServer));

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalInterceptors(app.get(LoggingInterceptor));

  const config = new DocumentBuilder()
    .setTitle('Election Management System')
    .setDescription('EMS API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));

  await app.init();
}

// Vercel serverless export — called for every incoming request
export default async function handler(req: any, res: any): Promise<void> {
  if (!nestBootstrap) nestBootstrap = bootstrap();
  await nestBootstrap;
  expressServer(req, res);
}

// Local development: start the HTTP server when not running on Vercel
if (!process.env.VERCEL) {
  bootstrap().then(() => expressServer.listen(Number(process.env.PORT) || 3000));
}
