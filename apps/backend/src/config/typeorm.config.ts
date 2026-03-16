import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { env } from 'src/common/constants/env';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get(env.DB_HOST),
    port: config.get(env.DB_PORT),
    username: config.get(env.DB_USERNAME),
    password: config.get(env.DB_PASSWORD),
    database: config.get(env.DB_NAME),
    autoLoadEntities: true,
    synchronize: true, // todo: only dev
  }),
};
