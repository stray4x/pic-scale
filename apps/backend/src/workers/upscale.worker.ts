import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobService } from '../modules/job/job.service';
import { STORAGE_PORT, type StoragePort } from '../ports/storage.port';
import { UPSCALER_PORT, type UpscalerPort } from '../ports/upscaler.port';
import { JobStatus } from '../modules/job/entities/job.entity';
import { randomUUID } from 'crypto';
import { queues } from 'src/common/constants/queues';
import { JobNotificationGateway } from 'src/modules/job-notifications/job-notifications.gateway';

interface UpscaleJobPayload {
  jobId: string;
  scale: number;
}

@Processor(queues.UPSCALE)
export class UpscaleWorker extends WorkerHost {
  private readonly logger = new Logger(UpscaleWorker.name);

  constructor(
    private readonly jobService: JobService,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
    @Inject(UPSCALER_PORT) private readonly upscaler: UpscalerPort,
    private readonly notifications: JobNotificationGateway,
  ) {
    super();
  }

  async process(job: Job<UpscaleJobPayload>): Promise<void> {
    const { jobId, scale } = job.data;
    this.logger.log(`Processing job ${jobId} with scale x${scale}`);

    await this.jobService.updateStatus(jobId, JobStatus.PROCESSING);
    this.notifications.emitJobUpdate(jobId, { status: JobStatus.PROCESSING });

    try {
      const jobEntity = await this.jobService.findById(jobId);

      const url = await this.storage.getPresignedUrl(
        jobEntity.originalStorageKey,
      );
      const response = await fetch(url);
      const inputBuffer = Buffer.from(await response.arrayBuffer());

      const outputBuffer = await this.upscaler.upscale(inputBuffer, scale);

      const resultKey = `results/${randomUUID()}.png`;
      const resultUrl = await this.storage.getPresignedUrl(resultKey);

      await this.storage.upload(outputBuffer, resultKey, 'image/png');

      await this.jobService.updateStatus(jobId, JobStatus.DONE, resultKey);
      this.notifications.emitJobUpdate(jobId, {
        status: JobStatus.DONE,
        resultUrl,
      });

      this.logger.log(`Job ${jobId} done`);
    } catch (error) {
      this.logger.error(`Job ${jobId} failed: ${error.message}`);

      await this.jobService.updateStatus(
        jobId,
        JobStatus.FAILED,
        undefined,
        error.message,
      );

      this.notifications.emitJobUpdate(jobId, {
        status: JobStatus.FAILED,
        errorMessage: error.message,
      });

      throw error;
    }
  }
}
