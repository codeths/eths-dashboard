import { Test, TestingModule } from '@nestjs/testing';
import { ExtService } from './ext.service';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { GatewayTimeoutException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Device } from 'src/schemas/Device.schema';
import { FirebaseToken } from 'src/schemas/FirebaseToken.schema';

jest.mock('axios');

describe('ExtService', () => {
  let service: ExtService;

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
          provide: getModelToken(Device.name),
          useValue: {},
        },
        {
          provide: getModelToken(FirebaseToken.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ExtService>(ExtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('[getResponseFromOneToOne] should return a response', () => {
    const data = {
      object: {
        serial: 'NXHQEAA0010241CC467600',
        deviceStatus: 'Given to Assignee',
        loanerStatus: 'Not A Loaner',
        startDate: '2020-07-14T09:50:05.487',
      },
      message: null,
      success: true,
    };
    const response = { data };

    const mockedAxios = jest.mocked(axios);
    mockedAxios.get.mockResolvedValue(response);

    expect(service.getResponseFromOneToOne('')).resolves.toStrictEqual(
      response,
    );
  });
  it('[getResponseFromOneToOne] should throw on timeouts', () => {
    const mockedAxios = jest.mocked(axios);
    mockedAxios.get.mockRejectedValue(new AxiosError());

    expect(async () => {
      await service.getResponseFromOneToOne('');
    }).rejects.toThrow(GatewayTimeoutException);
  });
  it('[generateToken] should should return an auth token', () => {
    expect(service.generateToken('', '')).resolves.toBeTruthy();
  });
});
