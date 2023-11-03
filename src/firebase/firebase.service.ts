import { Inject, Injectable } from '@nestjs/common';
import { MessagingInjectionToken } from './messaging.provider';
import { Messaging } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService {
  constructor(
    @Inject(MessagingInjectionToken)
    private readonly messagingService: Messaging,
  ) {}
}
