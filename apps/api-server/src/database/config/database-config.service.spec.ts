import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseConfigService } from './database-config.service';
import { HostService } from '@host';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { CmsConfigService } from '@cms-config/cms-config.service';
import * as common from '@common';

// Mock the checkCmsTokenError and checkCmsStatusError functions
jest.mock('@common', () => ({
  ...jest.requireActual('@common'),
  checkCmsTokenError: jest.fn(),
  checkCmsStatusError: jest.fn(),
}));

describe('DatabaseConfigService', () => {
  let service: DatabaseConfigService;
  let hostService: jest.Mocked<HostService>;
  let cmsClient: jest.Mocked<CmsHttpsClientService>;
  let cmsConfigService: jest.Mocked<CmsConfigService>;

  const mockHost = {
    uid: 'host-uid-1',
    id: 'host-1',
    address: 'localhost',
    port: 8001,
    password: 'host-password',
    token: 'test-token',
    dbProfiles: {},
  };

  const mockUserId = 'user-123';
  const mockHostUid = 'host-uid-1';
  const mockDbname = 'testdb';

  beforeEach(async () => {
    const mockHostService = {
      findHostInternal: jest.fn(),
    };

    const mockCmsClient = {
      postAuthenticated: jest.fn(),
    };

    const mockCmsConfigService = {
      getAllSystemParam: jest.fn(),
      setSystemParam: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseConfigService,
        {
          provide: HostService,
          useValue: mockHostService,
        },
        {
          provide: CmsHttpsClientService,
          useValue: mockCmsClient,
        },
        {
          provide: CmsConfigService,
          useValue: mockCmsConfigService,
        },
      ],
    }).compile();

    service = module.get<DatabaseConfigService>(DatabaseConfigService);
    hostService = module.get(HostService);
    cmsClient = module.get(CmsHttpsClientService);
    cmsConfigService = module.get(CmsConfigService);

    // Setup default mocks
    hostService.findHostInternal.mockResolvedValue(mockHost);
    (common.checkCmsTokenError as jest.Mock).mockImplementation(() => {});
    (common.checkCmsStatusError as jest.Mock).mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setAutoExecQuery', () => {
    const mockRequest = {
      dbname: mockDbname,
      planlist: [
        {
          queryplan: [],
        },
      ],
    };

    const mockResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'setautoexecquery',
    };

    it('should successfully set auto exec query', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.setAutoExecQuery(
        mockUserId,
        mockHostUid,
        mockDbname,
        mockRequest
      );

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'setautoexecquery',
          dbname: mockDbname,
          planlist: mockRequest.planlist,
        })
      );
      expect(result).toEqual({});
    });
  });

  describe('getAutoExecQuery', () => {
    const mockResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'getautoexecquery',
      planlist: [],
    };

    it('should successfully get auto exec query', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.getAutoExecQuery(mockUserId, mockHostUid, mockDbname);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'getautoexecquery',
          dbname: mockDbname,
        })
      );
      expect(result).toEqual({ planlist: [] });
    });
  });
});
