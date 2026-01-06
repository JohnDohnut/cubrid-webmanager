import { Test, TestingModule } from '@nestjs/testing';
import { HaMonitoringController } from './ha-monitoring.controller';

describe('HaMonitoringController', () => {
    let controller: HaMonitoringController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HaMonitoringController],
        }).compile();

        controller = module.get<HaMonitoringController>(HaMonitoringController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});

