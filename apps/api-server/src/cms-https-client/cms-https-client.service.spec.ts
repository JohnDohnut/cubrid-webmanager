import { Test, TestingModule } from '@nestjs/testing';
import { CmsHttpsClientService } from './cms-https-client.service';

describe('CmsHttpsClientService', () => {
  let service: CmsHttpsClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CmsHttpsClientService],
    }).compile();

    service = module.get<CmsHttpsClientService>(CmsHttpsClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
