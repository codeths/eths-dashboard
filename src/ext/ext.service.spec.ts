import { Test, TestingModule } from '@nestjs/testing';
import { ExtService } from './ext.service';
import { ConfigService } from '@nestjs/config';

describe('ExtService', () => {
  let service: ExtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, ExtService],
    }).compile();

    service = module.get<ExtService>(ExtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
