export const UPSCALER_PORT = 'UPSCALER_PORT';

export interface UpscalerPort {
  upscale(inputBuffer: Buffer, scale: number): Promise<Buffer>;
}
