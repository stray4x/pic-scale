import * as Joi from 'joi';
import { env } from 'src/common/constants/env';

export const envValidationSchema = Joi.object({
  [env.NODE_ENV]: Joi.string().valid('development', 'production', 'testing'),
  [env.APP_PORT]: Joi.number().port(),
  [env.FRONTEND_URL]: Joi.string().uri(),

  [env.DB_HOST]: Joi.string(),
  [env.DB_PORT]: Joi.number().port(),
  [env.DB_USERNAME]: Joi.string(),
  [env.DB_PASSWORD]: Joi.string().min(8),
  [env.DB_NAME]: Joi.string(),

  [env.REDIS_HOST]: Joi.string(),
  [env.REDIS_PORT]: Joi.number().port(),

  [env.S3_ENDPOINT]: Joi.string(),
  [env.S3_PORT]: Joi.number().port(),
  [env.S3_USE_SSL]: Joi.boolean(),
  [env.S3_ACCESS_KEY]: Joi.string(),
  [env.S3_SECRET_KEY]: Joi.string(),
  [env.S3_BUCKET]: Joi.string(),
  [env.S3_REGION]: Joi.string(),

  [env.UPSCALER_URL]: Joi.string(),
}).fork(Object.values(env), (schema) => schema.required());
