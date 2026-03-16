import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JobService } from '../job.service';
import { JobEntity, JobStatus } from '../entities/job.entity';

const mockJob: JobEntity = {
  id: 'test-uuid',
  status: JobStatus.PENDING,
  originalFilename: 'photo.jpg',
  originalStorageKey: 'originals/test-uuid.jpg',
  resultStorageKey: null,
  errorMessage: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
};

describe('JobService', () => {
  let service: JobService;
  let repo: Repository<JobEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,
        {
          provide: getRepositoryToken(JobEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get(JobService);
    repo = module.get(getRepositoryToken(JobEntity));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save a job', async () => {
      mockRepository.create.mockReturnValue(mockJob);
      mockRepository.save.mockResolvedValue(mockJob);

      const result = await service.create(
        'photo.jpg',
        'originals/test-uuid.jpg',
      );

      expect(repo.create).toHaveBeenCalledWith({
        originalFilename: 'photo.jpg',
        originalStorageKey: 'originals/test-uuid.jpg',
      });
      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(mockJob);
      expect(result).toEqual(mockJob);
    });
  });

  describe('findById', () => {
    it('should return job if found', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockJob);

      const result = await service.findById('test-uuid');

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 'test-uuid' });
      expect(result).toEqual(mockJob);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findById('bad-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all jobs ordered by createdAt DESC', async () => {
      mockRepository.find.mockResolvedValue([mockJob]);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
      expect(result).toEqual([mockJob]);
    });
  });

  describe('updateStatus', () => {
    it('should update status to processing', async () => {
      const updated = { ...mockJob, status: JobStatus.PROCESSING };
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.findOneBy.mockResolvedValue(updated);

      const result = await service.updateStatus(
        'test-uuid',
        JobStatus.PROCESSING,
      );

      expect(repo.update).toHaveBeenCalledWith('test-uuid', {
        status: JobStatus.PROCESSING,
      });
      expect(result.status).toBe(JobStatus.PROCESSING);
    });

    it('should update status to done with resultStorageKey', async () => {
      const updated = {
        ...mockJob,
        status: JobStatus.DONE,
        resultStorageKey: 'results/uuid.png',
      };
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.findOneBy.mockResolvedValue(updated);

      const result = await service.updateStatus(
        'test-uuid',
        JobStatus.DONE,
        'results/uuid.png',
      );

      expect(repo.update).toHaveBeenCalledWith('test-uuid', {
        status: JobStatus.DONE,
        resultStorageKey: 'results/uuid.png',
      });
      expect(result.resultStorageKey).toBe('results/uuid.png');
    });

    it('should update status to failed with errorMessage', async () => {
      const updated = {
        ...mockJob,
        status: JobStatus.FAILED,
        errorMessage: 'something went wrong',
      };
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.findOneBy.mockResolvedValue(updated);

      const result = await service.updateStatus(
        'test-uuid',
        JobStatus.FAILED,
        undefined,
        'something went wrong',
      );

      expect(repo.update).toHaveBeenCalledWith('test-uuid', {
        status: JobStatus.FAILED,
        errorMessage: 'something went wrong',
      });
      expect(result.errorMessage).toBe('something went wrong');
    });
  });
});
