import { Test, TestingModule } from '@nestjs/testing';
import { ResourceMonitoringService } from './resource-monitoring.service';

describe('ResourceMonitoringService', () => {
    let service: ResourceMonitoringService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ResourceMonitoringService],
        }).compile();

        service = module.get<ResourceMonitoringService>(ResourceMonitoringService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

