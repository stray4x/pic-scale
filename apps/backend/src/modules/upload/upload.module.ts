import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { JobModule } from '../job/job.module';
import { BullModule } from '@nestjs/bullmq';
import { queues } from 'src/common/constants/queues';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    JobModule,
    StorageModule,
    BullModule.registerQueue({ name: queues.UPSCALE }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
