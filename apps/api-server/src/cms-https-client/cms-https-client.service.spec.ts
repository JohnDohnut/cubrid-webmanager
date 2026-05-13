import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@config/config.service';
import { HostService } from '@host';
import { EncryptionService } from '@security';
import { CmsHttpsClientService } from './cms-https-client.service';

describe('CmsHttpsClientService', () => {
  let service: CmsHttpsClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CmsHttpsClientService,
        { provide: HttpService, useValue: {} },
        { provide: HostService, useValue: {} },
        { provide: EncryptionService, useValue: {} },
        {
          provide: ConfigService,
          useValue: {
            getCmsRejectUnauthorized: jest.fn().mockReturnValue(false),
            getCmsCaCert: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<CmsHttpsClientService>(CmsHttpsClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
