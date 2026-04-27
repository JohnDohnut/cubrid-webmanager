import { Test, TestingModule } from '@nestjs/testing';
import { CmsAuthController } from './cms-auth.controller';
import { CmsAuthService } from './cms-auth.service';

describe('CmsAuthController', () => {
  let controller: CmsAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CmsAuthController],
      providers: [{ provide: CmsAuthService, useValue: { login: jest.fn() } }],
    }).compile();

    controller = module.get<CmsAuthController>(CmsAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
