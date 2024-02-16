import { Test, TestingModule } from '@nestjs/testing';
import { ExtService } from './ext.service';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Device } from 'src/schemas/Device.schema';
import { FirebaseToken } from 'src/schemas/FirebaseToken.schema';
import { PingEventV1, RegistrationEventV1 } from 'src/schemas/Event.schema';
import { ExtUser } from 'src/schemas/ExtUser.schema';

jest.mock('axios');

describe('ExtService', () => {
  let service: ExtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'abc' })],
      providers: [
        ExtService,
        {
          provide: getModelToken(Device.name),
          useValue: {},
        },
        {
          provide: getModelToken(FirebaseToken.name),
          useValue: {},
        },
        {
          provide: getModelToken(PingEventV1.name),
          useValue: {},
        },
        {
          provide: getModelToken(ExtUser.name),
          useValue: {},
        },
        {
          provide: getModelToken(RegistrationEventV1.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ExtService>(ExtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('[generateToken] should should return an auth token', () => {
    expect(service.generateToken('', '')).resolves.toBeTruthy();
  });
});
