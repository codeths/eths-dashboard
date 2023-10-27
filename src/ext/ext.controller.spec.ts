import { Test, TestingModule } from '@nestjs/testing';
import { ExtController } from './ext.controller';
import { ConfigService } from '@nestjs/config';
import { ExtService } from './ext.service';

describe('ExtController', () => {
  let controller: ExtController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, ExtService],
      controllers: [ExtController],
    }).compile();

    controller = module.get<ExtController>(ExtController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
