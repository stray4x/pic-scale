import { Injectable, Logger } from '@nestjs/common';
import { JobService } from '../job/job.service';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly jobService: JobService) {}

  async uploadAndEnqueue(file: Express.Multer.File) {
    // TODO: replace with real StoragePort
    const fakeStorageKey = `originals/${randomUUID()}-${file.originalname}`;

    const job = await this.jobService.create(file.originalname, fakeStorageKey);

    // TODO: replace with real BullMQ queue
    this.logger.log(`Job ${job.id} created, enqueuing... (stub)`);

    return { jobId: job.id };
  }
}
