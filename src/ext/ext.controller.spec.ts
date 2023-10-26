import { Test, TestingModule } from '@nestjs/testing';
import { ExtController } from './ext.controller';

describe('ExtController', () => {
  let controller: ExtController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtController],
    }).compile();

    controller = module.get<ExtController>(ExtController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
