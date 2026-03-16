import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column } from 'typeorm';

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DONE = 'done',
  FAILED = 'failed',
}

@Entity('jobs')
export class Job extends BaseEntity {
  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.PENDING })
  status: JobStatus;

  @Column()
  originalFilename: string;

  @Column()
  originalStorageKey: string;

  @Column({ nullable: true })
  resultStorageKey: string | null;

  @Column({ nullable: true })
  errorMessage: string | null;
}
