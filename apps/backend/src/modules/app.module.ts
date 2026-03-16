import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'src/config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from 'src/config/env.config';
import { JobModule } from './job/job.module';
import { UploadModule } from './upload/upload.module';
import { BullModule } from '@nestjs/bullmq';
import { bullMqConfig } from 'src/config/bullmq.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    BullModule.forRootAsync(bullMqConfig),
    JobModule,
    UploadModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
