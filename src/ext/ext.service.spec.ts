import { Test, TestingModule } from '@nestjs/testing';
import { ExtService } from './ext.service';

describe('ExtService', () => {
  let service: ExtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtService],
    }).compile();

    service = module.get<ExtService>(ExtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
