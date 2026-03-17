import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UpscalerPort } from '../../ports/upscaler.port';
import { env } from '../../common/constants/env';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

@Injectable()
export class RealEsrganAdapter implements UpscalerPort {
  private readonly logger = new Logger(RealEsrganAdapter.name);
  private readonly executable: string;

  constructor(private readonly config: ConfigService) {
    this.executable = this.config.getOrThrow(env.REALESRGAN_EXECUTABLE);
  }

  async upscale(inputBuffer: Buffer, scale: number): Promise<Buffer> {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pic-scale-'));
    const inputPath = path.join(tmpDir, `${randomUUID()}.png`);
    const outputPath = path.join(tmpDir, `${randomUUID()}.png`);

    try {
      await fs.writeFile(inputPath, inputBuffer);

      this.logger.log(`Upscaling: ${inputPath} → ${outputPath}`);

      await execFileAsync(this.executable, [
        '-i',
        inputPath,
        '-o',
        outputPath,
        '-s',
        String(scale),
        '-n',
        'realesrgan-x4plus',
      ]);

      return fs.readFile(outputPath);
    } finally {
      // Always clean up tmp files even if upscaling failed
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }
}
