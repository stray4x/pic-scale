import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { JobModule } from '../job/job.module';

@Module({
  imports: [JobModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
