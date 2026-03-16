import { SharedBullAsyncConfiguration } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { env } from 'src/common/constants/env';

export const bullMqConfig: SharedBullAsyncConfiguration = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    connection: {
      host: config.get(env.REDIS_HOST),
      port: config.get(env.REDIS_PORT),
    },
  }),
};
