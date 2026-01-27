import { Test, TestingModule } from '@nestjs/testing';
import { HaMonitoringService } from './ha-monitoring.service';

describe('HaMonitoringService', () => {
  let service: HaMonitoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HaMonitoringService],
    }).compile();

    service = module.get<HaMonitoringService>(HaMonitoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
