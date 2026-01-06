import { Test, TestingModule } from '@nestjs/testing';
import { ResourceMonitoringController } from './resource-monitoring.controller';

describe('ResourceMonitoringController', () => {
    let controller: ResourceMonitoringController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ResourceMonitoringController],
        }).compile();

        controller = module.get<ResourceMonitoringController>(ResourceMonitoringController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});

