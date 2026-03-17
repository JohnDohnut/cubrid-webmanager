import { Test, TestingModule } from '@nestjs/testing';
import { BrokerController } from './broker.controller';
import { BrokerService } from './broker.service';

describe('BrokerController', () => {
  let controller: BrokerController;

  beforeEach(async () => {
    const mockBrokerService = {
      getBrokers: jest.fn(),
      stopBroker: jest.fn(),
      startBroker: jest.fn(),
      restartBroker: jest.fn(),
      getBrokerStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrokerController],
      providers: [
        { provide: BrokerService, useValue: mockBrokerService },
      ],
    }).compile();

    controller = module.get<BrokerController>(BrokerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
