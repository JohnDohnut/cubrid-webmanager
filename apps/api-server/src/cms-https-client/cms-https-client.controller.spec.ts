import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@config/config.service';
import { CmsHttpsClientController } from './cms-https-client.controller';
import { CmsHttpsClientService } from './cms-https-client.service';

describe('CmsHttpsClientController', () => {
  let controller: CmsHttpsClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CmsHttpsClientController],
      providers: [
        {
          provide: CmsHttpsClientService,
          useValue: {
            forwardAuthenticated: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            isCmsForwardEnabled: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<CmsHttpsClientController>(CmsHttpsClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
