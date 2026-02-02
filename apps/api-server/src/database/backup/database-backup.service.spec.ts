import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseBackupService } from './database-backup.service';
import { HostService } from '@host';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { AddBackupInfoClientRequest, SetBackupInfoClientRequest } from '@api-interfaces';
import * as common from '@common';

// Mock the checkCmsTokenError and checkCmsStatusError functions
jest.mock('@common', () => ({
  ...jest.requireActual('@common'),
  checkCmsTokenError: jest.fn(),
  checkCmsStatusError: jest.fn(),
}));

describe('DatabaseBackupService', () => {
  let service: DatabaseBackupService;
  let hostService: jest.Mocked<HostService>;
  let cmsClient: jest.Mocked<CmsHttpsClientService>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseBackupService,
        {
          provide: HostService,
          useValue: mockHostService,
        },
        {
          provide: CmsHttpsClientService,
          useValue: mockCmsClient,
        },
      ],
    }).compile();

    service = module.get<DatabaseBackupService>(DatabaseBackupService);
    hostService = module.get(HostService);
    cmsClient = module.get(CmsHttpsClientService);

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

  describe('addBackupSchedule', () => {
    const mockRequest: AddBackupInfoClientRequest = {
      dbname: mockDbname,
      backupid: 'test_backup',
      path: '/path/to/backup',
      period_type: 'daily',
      period_date: '1',
      time: '02:00',
      level: '0',
      archivedel: 'ON',
      updatestatus: 'ON',
      storeold: 'ON',
      onoff: 'ON',
      zip: 'y',
      check: 'y',
      mt: '0',
      bknum: '0',
    };

    const mockResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'addbackupinfo',
    };

    it('should successfully add backup schedule', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.addBackupSchedule(
        mockUserId,
        mockHostUid,
        mockDbname,
        mockRequest
      );

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'addbackupinfo',
          dbname: mockDbname,
          backupid: mockRequest.backupid,
          path: mockRequest.path,
        })
      );
      expect(result).toEqual({});
    });
  });

  describe('setBackupSchedule', () => {
    const mockRequest: SetBackupInfoClientRequest = {
      dbname: mockDbname,
      backupid: 'test_backup',
      path: '/path/to/backup',
      period_type: 'daily',
      period_date: '1',
      time: '02:00',
      level: '0',
      archivedel: 'ON',
      updatestatus: 'ON',
      storeold: 'ON',
      onoff: 'ON',
      zip: 'y',
      check: 'y',
      mt: '0',
      bknum: '0',
    };

    const mockResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'setbackupinfo',
    };

    it('should successfully set backup schedule', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.setBackupSchedule(
        mockUserId,
        mockHostUid,
        mockDbname,
        mockRequest
      );

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'setbackupinfo',
          dbname: mockDbname,
        })
      );
      expect(result).toEqual({
        __EXEC_TIME: '10 ms',
        note: 'none',
        status: 'success',
        task: 'setbackupinfo',
      });
    });
  });

  describe('deleteBackupSchedule', () => {
    const mockRequest = {
      dbname: mockDbname,
      backupid: 'test_backup',
    };

    const mockResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'deletebackupinfo',
    };

    it('should successfully delete backup schedule', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.deleteBackupSchedule(
        mockUserId,
        mockHostUid,
        mockDbname,
        mockRequest
      );

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'deletebackupinfo',
          dbname: mockDbname,
          backupid: mockRequest.backupid,
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe('getBackupSchedule', () => {
    const mockResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'getbackupinfo',
      dbname: 'testdb',
      backups: [],
    };

    it('should successfully get backup schedule', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.getBackupSchedule(mockUserId, mockHostUid, mockDbname);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'getbackupinfo',
          dbname: mockDbname,
        })
      );
      expect(result).toEqual({
        dbname: 'testdb',
        backups: [],
      });
    });
  });
});
