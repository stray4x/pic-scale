import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 20 * 1024 * 1024;

export default FileInterceptor('file', {
  limits: { fileSize: MAX_FILE_SIZE_MB },
  fileFilter: (_, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new BadRequestException('Only JPEG, PNG and WebP are allowed'),
        false,
      );
    }

    cb(null, true);
  },
});
