import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { MessagingInjectionToken } from './messaging.provider';
import { Messaging } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService {
  constructor(
    @Inject(MessagingInjectionToken)
    private readonly messagingService: Messaging,
  ) {}
  private readonly logger = new Logger(FirebaseService.name);

  getSerialTopic(deviceSerial: string) {
    return `serial_${deviceSerial}`;
  }

  async mapTokenToDevice(deviceSerial: string, firebaseToken: string) {
    const topic = this.getSerialTopic(deviceSerial);

    const res = await this.messagingService.subscribeToTopic(
      [firebaseToken],
      topic,
    );

    if (res.errors.length > 0) throw res.errors.map((e) => e.error);
  }
  async attemptSend(deviceSerial: string) {
    const messageID = randomUUID();
    this.logger.log(`Sending message; ID = ${messageID}`);

    return await this.messagingService.send({
      data: {
        id: messageID,
      },
      topic: this.getSerialTopic(deviceSerial),
    });
  }
}
