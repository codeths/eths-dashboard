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

  async mapTokenToDevice(deviceSerial: string, firebaseToken: string) {
    const topic = `serial_${deviceSerial}`;
    try {
      const res = await this.messagingService.subscribeToTopic(
        firebaseToken,
        topic,
      );
      this.logger.debug(res);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
