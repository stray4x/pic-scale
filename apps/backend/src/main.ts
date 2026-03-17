import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ConfigService } from '@nestjs/config';
import { env } from './common/constants/env';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'debug', 'verbose'],
  });

  const config = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(config.get(env.APP_PORT) ?? 3000);
}
void bootstrap();
