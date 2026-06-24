import { Test, TestingModule } from '@nestjs/testing';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { CmsConfigService } from '@cms-config/cms-config.service';
import { UserRepositoryService } from '@repository';
import { HaService } from '@ha';
import { CmsAuthService } from './cms-auth.service';

describe('CMSAuthService', () => {
  let service: CmsAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CmsAuthService,
        { provide: CmsHttpsClientService, useValue: { postPublic: jest.fn() } },
        {
          provide: UserRepositoryService,
          useValue: { loadUserById: jest.fn(), atomicUpdateUser: jest.fn() },
        },
        { provide: CmsConfigService, useValue: { getAllSystemParam: jest.fn() } },
        { provide: HaService, useValue: { heartbeatlistInternal: jest.fn() } },
      ],
    }).compile();

    service = module.get<CmsAuthService>(CmsAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
