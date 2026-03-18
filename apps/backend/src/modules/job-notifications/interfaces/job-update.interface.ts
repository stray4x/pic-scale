import { JobStatus } from 'src/modules/job/entities/job.entity';

export interface JobUpdatePayload {
  status: JobStatus;
  resultUrl?: string;
  errorMessage?: string;
}
