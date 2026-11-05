import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'https://e-commerce-pu4a.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000/api`);
}
bootstrap();
