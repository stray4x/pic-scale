import { Module } from '@nestjs/common';
import { UPSCALER_PORT } from '../../ports/upscaler.port';
import { RealEsrganAdapter } from 'src/adapters/upscaler/real-esrgan.adapter';

@Module({
  providers: [
    {
      provide: UPSCALER_PORT,
      useClass: RealEsrganAdapter,
    },
  ],
  exports: [UPSCALER_PORT],
})
export class UpscalerModule {}
