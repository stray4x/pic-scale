export const STORAGE_PORT = 'STORAGE_PORT';

export interface StoragePort {
  upload(buffer: Buffer, key: string, mimetype: string): Promise<void>;
  getPresignedUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}
