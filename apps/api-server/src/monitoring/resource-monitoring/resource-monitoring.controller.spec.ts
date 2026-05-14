import { Test, TestingModule } from '@nestjs/testing';
import { ResourceMonitoringController } from './resource-monitoring.controller';
import { ResourceMonitoringService } from './resource-monitoring.service';

describe('ResourceMonitoringController', () => {
  let controller: ResourceMonitoringController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourceMonitoringController],
      providers: [{ provide: ResourceMonitoringService, useValue: {} }],
    }).compile();

    controller = module.get<ResourceMonitoringController>(ResourceMonitoringController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
