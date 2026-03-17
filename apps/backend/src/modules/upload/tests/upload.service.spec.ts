import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from '../upload.service';
import { JobService } from '../../job/job.service';
import { JobEntity, JobStatus } from '../../job/entities/job.entity';
import { STORAGE_PORT } from 'src/ports/storage.port';
import { getQueueToken } from '@nestjs/bullmq';
import { queues } from 'src/common/constants/queues';

const mockJob: JobEntity = {
  id: 'test-uuid',
  status: JobStatus.PENDING,
  originalFilename: 'photo.jpg',
  originalStorageKey: 'originals/fake-uuid-photo.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStorage = {
  upload: jest.fn(),
};

const mockQueue = {
  add: jest.fn(),
};

const mockJobService = {
  create: jest.fn(),
};

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: JobService,
          useValue: mockJobService,
        },
        {
          provide: STORAGE_PORT,
          useValue: mockStorage,
        },
        {
          provide: getQueueToken(queues.UPSCALE),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    jest.clearAllMocks();
  });

  describe('uploadAndEnqueue', () => {
    it('should create a job and return jobId', async () => {
      const file = {
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from(''),
        size: 100,
      } as Express.Multer.File;

      mockStorage.upload.mockResolvedValue(undefined);
      mockJobService.create.mockResolvedValue(mockJob);
      mockQueue.add.mockResolvedValue(undefined);

      const result = await service.uploadAndEnqueue(file);

      expect(mockStorage.upload).toHaveBeenCalledWith(
        file.buffer,
        expect.stringMatching(/^originals\/.+-photo\.jpg$/),
        file.mimetype,
      );

      expect(mockJobService.create).toHaveBeenCalledWith(
        'photo.jpg',
        expect.stringMatching(/^originals\/.+-photo\.jpg$/),
      );

      expect(mockQueue.add).toHaveBeenCalledWith('upscale', {
        jobId: mockJob.id,
      });

      expect(result).toEqual({ jobId: mockJob.id });
    });
  });
});
