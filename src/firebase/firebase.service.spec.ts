import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from './firebase.service';
import { MessagingProvider } from './messaging.provider';

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagingProvider, FirebaseService],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
