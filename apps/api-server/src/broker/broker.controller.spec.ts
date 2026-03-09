import { Test, TestingModule } from '@nestjs/testing';
import { BrokerController } from './broker.controller';
import { BrokerService } from './broker.service';

describe('BrokerController', () => {
  let controller: BrokerController;
  let brokerService: jest.Mocked<BrokerService>;

  beforeEach(async () => {
    const mockBrokerService = {
      getBrokers: jest.fn(),
      stopBroker: jest.fn(),
      startBroker: jest.fn(),
      restartBroker: jest.fn(),
      getBrokerStatus: jest.fn(),
      startAllBrokers: jest.fn(),
      stopAllBrokers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrokerController],
      providers: [
        {
          provide: BrokerService,
          useValue: mockBrokerService,
        },
      ],
    }).compile();

    controller = module.get<BrokerController>(BrokerController);
    brokerService = module.get(BrokerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('startAllBrokers', () => {
    it('should call brokerService.startAllBrokers and return { success: true }', async () => {
      const req = { user: { sub: 'user-123' } };
      brokerService.startAllBrokers.mockResolvedValue({ success: true });

      const result = await controller.startAllBrokers(req, 'host-uid-1');

      expect(brokerService.startAllBrokers).toHaveBeenCalledWith(
        'user-123',
        'host-uid-1'
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('stopAllBrokers', () => {
    it('should call brokerService.stopAllBrokers and return { success: true }', async () => {
      const req = { user: { sub: 'user-123' } };
      brokerService.stopAllBrokers.mockResolvedValue({ success: true });

      const result = await controller.stopAllBrokers(req, 'host-uid-1');

      expect(brokerService.stopAllBrokers).toHaveBeenCalledWith(
        'user-123',
        'host-uid-1'
      );
      expect(result).toEqual({ success: true });
    });
  });
});
