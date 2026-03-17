import { Test, TestingModule } from '@nestjs/testing';
import { BrokerService } from './broker.service';
import { HostService } from '@host';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
describe('BrokerService', () => {
  let service: BrokerService;

  const mockHost = {
    uid: 'host-uid-1',
    id: 'host-1',
    address: 'localhost',
    port: 8001,
    password: 'host-password',
    token: 'test-token',
  };

  beforeEach(async () => {
    const mockHostService = {
      findHostInternal: jest.fn().mockResolvedValue(mockHost),
    };
    const mockCmsClient = { postAuthenticated: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrokerService,
        { provide: HostService, useValue: mockHostService },
        { provide: CmsHttpsClientService, useValue: mockCmsClient },
      ],
    }).compile();

    service = module.get<BrokerService>(BrokerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
