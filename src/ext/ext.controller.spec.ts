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

  async function mockRequest() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await controller.getStatus({ set: jest.fn() }, '');
  }

  it('[/status] should error if response is unsucessful', () => {
    mockedExtResponse.mockImplementationOnce(() =>
      Promise.resolve({ data: { ...response.data, success: false } }),
    );
    expect(mockRequest()).rejects.toThrowError(InternalServerErrorException);
  });
  it('[/status] should error if response has no object', () => {
    mockedExtResponse.mockImplementationOnce(() =>
      Promise.resolve({ data: { ...response.data, object: undefined } }),
    );
    expect(mockRequest()).rejects.toThrowError(BadGatewayException);
  });
  it('[/status] should resolve if response is good', () => {
    mockedExtResponse.mockImplementationOnce(() => Promise.resolve(response));
    expect(mockRequest()).resolves.toStrictEqual({ status });
  });
});
