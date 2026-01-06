import { Test, TestingModule } from '@nestjs/testing';
import { CmsHttpsClientController } from './cms-https-client.controller';

describe('CmsHttpsClientController', () => {
  let controller: CmsHttpsClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CmsHttpsClientController],
    }).compile();

    controller = module.get<CmsHttpsClientController>(CmsHttpsClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
