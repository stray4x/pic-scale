import { Module } from '@nestjs/common';
import { S3Adapter } from '../../adapters/storage/s3.adapter';
import { STORAGE_PORT } from '../../ports/storage.port';

@Module({
  providers: [
    {
      provide: STORAGE_PORT,
      useClass: S3Adapter,
    },
  ],
  exports: [STORAGE_PORT],
})
export class StorageModule {}
