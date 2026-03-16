import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column } from 'typeorm';

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DONE = 'done',
  FAILED = 'failed',
}

@Entity('jobs')
export class JobEntity extends BaseEntity {
  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.PENDING })
  status: JobStatus;

  @Column()
  originalFilename: string;

  @Column()
  originalStorageKey: string;

  @Column({ nullable: true })
  resultStorageKey: string;

  @Column({ nullable: true })
  errorMessage: string;
}
