import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../../common/constants/env';
import { StoragePort } from '../../ports/storage.port';

@Injectable()
export class S3Adapter implements StoragePort, OnModuleInit {
  private readonly logger = new Logger(S3Adapter.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = `http://${config.get(env.S3_ENDPOINT)}:${config.get(env.S3_PORT)}`;

    this.client = new S3Client({
      endpoint,
      region: config.getOrThrow(env.S3_REGION),
      credentials: {
        accessKeyId: config.getOrThrow(env.S3_ACCESS_KEY),
        secretAccessKey: config.getOrThrow(env.S3_SECRET_KEY),
      },
      forcePathStyle: true, // necessary for MinIO
    });

    this.bucket = config.getOrThrow(env.S3_BUCKET);
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Bucket "${this.bucket}" created`);
    }
  }

  async upload(buffer: Buffer, key: string, mimetype: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      }),
    );
  }

  async getPresignedUrl(key: string): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: 60 * 60 * 24 },
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
