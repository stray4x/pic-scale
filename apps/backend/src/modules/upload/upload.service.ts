import { Injectable, Logger } from '@nestjs/common';
import { JobService } from '../job/job.service';
import { randomUUID } from 'crypto';
import { InjectQueue } from '@nestjs/bullmq';
import { queues } from 'src/common/constants/queues';
import { Queue } from 'bullmq';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly jobService: JobService,
    @InjectQueue(queues.UPSCALE)
    private readonly upscaleQueue: Queue,
  ) {}

  async uploadAndEnqueue(file: Express.Multer.File) {
    // TODO: replace with real StoragePort
    const fakeStorageKey = `originals/${randomUUID()}-${file.originalname}`;

    const job = await this.jobService.create(file.originalname, fakeStorageKey);

    await this.upscaleQueue.add('upscale', { jobId: job.id });
    this.logger.log(`Job ${job.id} added to queue`);

    return { jobId: job.id };
  }
}
