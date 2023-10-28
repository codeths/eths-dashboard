import { Test, TestingModule } from '@nestjs/testing';
import { ExtService } from './ext.service';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { GatewayTimeoutException } from '@nestjs/common';

jest.mock('axios');

describe('ExtService', () => {
  let service: ExtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExtService,
        {
          provide: ConfigService,
          useValue: {
            // mock API key
            getOrThrow: jest.fn(() => ''),
          },
        },
      ],
    }).compile();

    service = module.get<ExtService>(ExtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should return a response', () => {
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
  it('should throw on timeouts', () => {
    const mockedAxios = jest.mocked(axios);
    mockedAxios.get.mockRejectedValue(new AxiosError());

    expect(async () => {
      await service.getResponseFromOneToOne('');
    }).rejects.toThrow(GatewayTimeoutException);
  });
});
