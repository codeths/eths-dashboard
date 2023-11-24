import { Test, TestingModule } from '@nestjs/testing';
import { ExtController } from './ext.controller';
import { ConfigService } from '@nestjs/config';
import { ExtService } from './ext.service';
import { DeviceState, OneToOneStatus } from 'common/ext/oneToOneStatus.dto';
import {
  BadGatewayException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { RegistrationDto } from 'common/ext/registration.dto';
import { getModelToken } from '@nestjs/mongoose';
import { Device } from 'src/schemas/Device.schema';
import { FirebaseToken } from 'src/schemas/FirebaseToken.schema';
import { FirebaseService } from 'src/firebase/firebase.service';
import { PingEventV1, RegistrationEventV1 } from 'src/schemas/Event.schema';
import { ExtUser } from 'src/schemas/ExtUser.schema';

describe('ExtController', () => {
  let controller: ExtController;
  let mockedExtResponse: jest.SpyInstance<Promise<{ data: OneToOneStatus }>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'abc' })],
      providers: [
        ExtService,
        {
          provide: ConfigService,
          useValue: {
            // mock API key
            getOrThrow: jest.fn(() => ''),
          },
        },
        {
          provide: FirebaseService,
          useValue: {
            mapTokenToDevice: jest.fn(),
            attemptSend: jest.fn(),
          },
        },
        {
          provide: getModelToken(Device.name),
          useValue: {
            findOneAndUpdate: jest.fn(() => ({ id: 'AAA' })),
            findOne: jest.fn(() => ({ id: 'AAA' })),
          },
        },
        {
          provide: getModelToken(FirebaseToken.name),
          useValue: {
            findOneAndUpdate: jest.fn(() => ({ id: 'AAA' })),
          },
        },
        {
          provide: getModelToken(PingEventV1.name),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: getModelToken(ExtUser.name),
          useValue: {
            findOneAndUpdate: jest.fn(() => ({ id: 'AAA' })),
          },
        },
        {
          provide: getModelToken(RegistrationEventV1.name),
          useValue: jest.fn(() => ({
            save: jest.fn(),
          })),
        },
      ],
      controllers: [ExtController],
    }).compile();

    controller = module.get<ExtController>(ExtController);
    const service = module.get<ExtService>(ExtService);
    mockedExtResponse = jest.spyOn(service, 'getResponseFromOneToOne');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const status: DeviceState = {
    serial: 'NXHQEAA0010241CC467600',
    deviceStatus: 'Given to Assignee',
    loanerStatus: 'Not A Loaner',
    startDate: '2020-07-14T09:50:05.487',
  };
  const response: { data: OneToOneStatus } = {
    data: {
      object: status,
      message: null,
      success: true,
    },
  };

  async function mockRegisterRequest(set?: jest.Mock, cookie?: jest.Mock) {
    const device = plainToInstance(RegistrationDto, {
      serial: status.serial,
      alertToken: '',
    });
    const req = {};
    const res = {
      set: set || jest.fn(),
      cookie: cookie || jest.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await controller.register(device, req, res);
  }

  it('[POST /register] should error if response is unsuccessful', () => {
    mockedExtResponse.mockImplementationOnce(() =>
      Promise.resolve({ data: { ...response.data, success: false } }),
    );
    expect(mockRegisterRequest()).rejects.toThrowError(
      InternalServerErrorException,
    );
  });
  it('[POST /register] should error if response has no object', () => {
    mockedExtResponse.mockImplementationOnce(() =>
      Promise.resolve({ data: { ...response.data, object: undefined } }),
    );
    expect(mockRegisterRequest()).rejects.toThrowError(BadGatewayException);
  });
  it('[POST /register] should resolve if response is good', () => {
    mockedExtResponse.mockImplementationOnce(() => Promise.resolve(response));
    expect(mockRegisterRequest()).resolves.toStrictEqual({ status });
  });
  it('[POST /register] should measure onetoone latency', async () => {
    mockedExtResponse.mockImplementationOnce(() => Promise.resolve(response));
    const mockSet = jest.fn();
    await mockRegisterRequest(mockSet);
    expect(mockSet).toHaveBeenCalled();
  });
  it("[POST /register] shouldn't set auth cookie on errors", async () => {
    const mockCookie = jest.fn();
    mockedExtResponse.mockImplementationOnce(() =>
      Promise.resolve({ data: { ...response.data, success: false } }),
    );
    await mockRegisterRequest(undefined, mockCookie).catch(() => {});
    expect(mockCookie).not.toHaveBeenCalled();
  });
  it('[POST /register] should set auth cookie if response is good', async () => {
    mockedExtResponse.mockImplementationOnce(() => Promise.resolve(response));
    const mockCookie = jest.fn();
    await mockRegisterRequest(undefined, mockCookie).catch(() => {});
    expect(mockCookie).toHaveBeenCalled();
  });
});
