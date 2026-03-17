import { Inject, Injectable, Logger } from '@nestjs/common';
import { JobService } from '../job/job.service';
import { randomUUID } from 'crypto';
import { InjectQueue } from '@nestjs/bullmq';
import { queues } from 'src/common/constants/queues';
import { Queue } from 'bullmq';
import { STORAGE_PORT, type StoragePort } from 'src/ports/storage.port';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly jobService: JobService,
    @InjectQueue(queues.UPSCALE) private readonly upscaleQueue: Queue,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
  ) {}

  async uploadAndEnqueue(file: Express.Multer.File, scale: number) {
    const key = `originals/${randomUUID()}-${file.originalname}`;

    await this.storage.upload(file.buffer, key, file.mimetype);

    const job = await this.jobService.create(file.originalname, key, scale);

    await this.upscaleQueue.add('upscale', { jobId: job.id, scale });
    this.logger.log(`Job ${job.id} added to queue`);

    return { jobId: job.id };
  }
}
