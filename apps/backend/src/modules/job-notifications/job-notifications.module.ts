import { Module } from '@nestjs/common';
import { JobNotificationGateway } from './job-notifications.gateway';

@Module({
  providers: [JobNotificationGateway],
  exports: [JobNotificationGateway],
})
export class JobNotificationsModule {}
