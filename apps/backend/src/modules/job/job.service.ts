import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobEntity, JobStatus } from './entities/job.entity';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(JobEntity)
    private readonly jobRepository: Repository<JobEntity>,
  ) {}

  async create(
    originalFilename: string,
    originalStorageKey: string,
    scale: number,
  ): Promise<JobEntity> {
    const job = this.jobRepository.create({
      originalFilename,
      originalStorageKey,
      scale,
    });

    return this.jobRepository.save(job);
  }

  async findById(id: string): Promise<JobEntity> {
    const job = await this.jobRepository.findOneBy({ id });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async findAll(): Promise<JobEntity[]> {
    return this.jobRepository.find({ order: { createdAt: 'DESC' } });
  }

  async updateStatus(
    id: string,
    status: JobStatus,
    resultStorageKey?: string,
    errorMessage?: string,
  ): Promise<JobEntity> {
    await this.jobRepository.update(id, {
      status,
      ...(resultStorageKey && { resultStorageKey }),
      ...(errorMessage && { errorMessage }),
    });

    return this.findById(id);
  }
}
