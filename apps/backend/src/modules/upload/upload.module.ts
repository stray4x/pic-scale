import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { JobModule } from '../job/job.module';
import { BullModule } from '@nestjs/bullmq';
import { queues } from 'src/common/constants/queues';

@Module({
  imports: [JobModule, BullModule.registerQueue({ name: queues.UPSCALE })],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
