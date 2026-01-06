import { Test, TestingModule } from '@nestjs/testing';
import { CmsConfigController } from './cms-config.controller';

describe('CmsConfigController', () => {
  let controller: CmsConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CmsConfigController],
    }).compile();

    controller = module.get<CmsConfigController>(CmsConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
