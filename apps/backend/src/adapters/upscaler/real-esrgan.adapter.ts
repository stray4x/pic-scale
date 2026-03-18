import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UpscalerPort } from '../../ports/upscaler.port';
import { env } from '../../common/constants/env';

@Injectable()
export class RealEsrganAdapter implements UpscalerPort {
  private readonly logger = new Logger(RealEsrganAdapter.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.getOrThrow(env.UPSCALER_URL);
  }

  async upscale(inputBuffer: Buffer, scale: number): Promise<Buffer> {
    this.logger.log(`Sending image to upscaler, scale x${scale}`);

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(inputBuffer)], { type: 'image/png' });
    formData.append('file', blob, 'image.png');
    formData.append('scale', String(scale));

    const response = await fetch(`${this.baseUrl}/upscale`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upscaler failed: ${error}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
