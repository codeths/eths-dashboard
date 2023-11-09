import { Module } from '@nestjs/common';
import { MessagingProvider } from './messaging.provider';
import { FirebaseService } from './firebase.service';

@Module({
  providers: [MessagingProvider, FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
