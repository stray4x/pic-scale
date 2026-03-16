import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from '../upload.service';
import { JobService } from '../../job/job.service';
import { JobEntity, JobStatus } from '../../job/entities/job.entity';

const mockJob: JobEntity = {
  id: 'test-uuid',
  status: JobStatus.PENDING,
  originalFilename: 'photo.jpg',
  originalStorageKey: 'originals/fake-uuid-photo.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
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
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    jest.clearAllMocks();
  });

  describe('uploadAndEnqueue', () => {
    it('should create a job and return jobId', async () => {
      mockJobService.create.mockResolvedValue(mockJob);

      const file = {
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from(''),
        size: 100,
      } as Express.Multer.File;

      const result = await service.uploadAndEnqueue(file);

      expect(mockJobService.create).toHaveBeenCalledWith(
        'photo.jpg',
        expect.stringMatching(/^originals\/.+-photo\.jpg$/),
      );
      expect(result).toEqual({ jobId: mockJob.id });
    });
  });
});
