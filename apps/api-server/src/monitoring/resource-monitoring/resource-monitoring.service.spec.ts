import { Test, TestingModule } from '@nestjs/testing';
import { ResourceMonitoringService } from './resource-monitoring.service';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { HostService } from '@host';

describe('ResourceMonitoringService', () => {
  let service: ResourceMonitoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceMonitoringService,
        { provide: CmsHttpsClientService, useValue: {} },
        { provide: HostService, useValue: {} },
      ],
    }).compile();

    service = module.get<ResourceMonitoringService>(ResourceMonitoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
