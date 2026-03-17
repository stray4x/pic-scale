import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
} from '@nestjs/common';

import { UploadService } from './upload.service';
import FileInterceptor from './interceptors/file.interceptor';
import { UploadDto } from './dto/upload.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor)
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.uploadService.uploadAndEnqueue(file, dto.scale);
  }
}
