import { Test, TestingModule } from '@nestjs/testing';
import { OneToOneService } from './OneToOne.service';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { GatewayTimeoutException } from '@nestjs/common';

jest.mock('axios');

describe('OneToOneService', () => {
  let service: OneToOneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OneToOneService,
        {
          provide: ConfigService,
          useValue: {
            // mock API key
            getOrThrow: jest.fn(() => ''),
          },
        },
      ],
    }).compile();

    service = module.get<OneToOneService>(OneToOneService);
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
});
