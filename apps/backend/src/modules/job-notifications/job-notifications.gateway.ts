import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JobUpdatePayload } from './interfaces/job-update.interface';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/upscale' })
export class JobNotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(JobNotificationGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:job')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() jobId: string,
  ) {
    void client.join(`job:${jobId}`);
    this.logger.log(`Client ${client.id} subscribed to job:${jobId}`);
  }

  emitJobUpdate(jobId: string, payload: JobUpdatePayload) {
    this.server.to(`job:${jobId}`).emit('job:updated', { jobId, ...payload });
  }
}
