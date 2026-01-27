import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { HostService } from '@host';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { UserRepositoryService } from '@repository';
import { CmsConfigService } from '@cms-config/cms-config.service';
import { FileService } from '@file/file.service';
import { DatabaseError } from '@error/database/database-error';
import { HostError } from '@error/index';
import { CmsError } from '@error/cms/cms-error';
import {
  UnloadDatabaseRequest,
  AddBackupInfoClientRequest,
  SetBackupInfoClientRequest,
} from '@api-interfaces';
import { UnloadDatabaseCmsResponse } from '@type/cms-response';
import * as common from '@common';

// Mock the checkCmsTokenError and checkCmsStatusError functions
jest.mock('@common', () => ({
  ...jest.requireActual('@common'),
  checkCmsTokenError: jest.fn(),
  checkCmsStatusError: jest.fn(),
}));

describe('DatabaseService', () => {
  let service: DatabaseService;
  let hostService: jest.Mocked<HostService>;
  let cmsClient: jest.Mocked<CmsHttpsClientService>;
  let repository: jest.Mocked<UserRepositoryService>;
  let cmsConfigService: jest.Mocked<CmsConfigService>;
  let fileService: jest.Mocked<FileService>;

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

    const mockRepository = {};

    const mockCmsConfigService = {};

    const mockFileService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: HostService,
          useValue: mockHostService,
        },
        {
          provide: CmsHttpsClientService,
          useValue: mockCmsClient,
        },
        {
          provide: UserRepositoryService,
          useValue: mockRepository,
        },
        {
          provide: CmsConfigService,
          useValue: mockCmsConfigService,
        },
        {
          provide: FileService,
          useValue: mockFileService,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
    hostService = module.get(HostService);
    cmsClient = module.get(CmsHttpsClientService);
    repository = module.get(UserRepositoryService);
    cmsConfigService = module.get(CmsConfigService);
    fileService = module.get(FileService);

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

  describe('unloadDatabase', () => {
    const baseRequest: UnloadDatabaseRequest = {
      targetdir: '/path/to/backup',
      isSchemaIncluded: true,
      isDataIncluded: true,
      dbuser: 'dba',
      dbpasswd: 'password',
    };

    const mockSuccessResponse: UnloadDatabaseCmsResponse = {
      __EXEC_TIME: '89 ms',
      note: 'none',
      status: 'success',
      task: 'unloaddb',
      result: [
        {
          'dba.test': '0 (100%/100%)',
          'dba.test2': '0 (100%/100%)',
        },
      ],
    };

    it('should successfully unload database with both schema and data', async () => {
      const request: UnloadDatabaseRequest = {
        ...baseRequest,
        isSchemaIncluded: true,
        isDataIncluded: true,
      };

      cmsClient.postAuthenticated.mockResolvedValue(mockSuccessResponse);

      const result = await service.unloadDatabase(mockUserId, mockHostUid, mockDbname, request);

      expect(hostService.findHostInternal).toHaveBeenCalledWith(mockUserId, mockHostUid);
      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        `https://${mockHost.address}:${mockHost.port}/cm_api`,
        expect.objectContaining({
          task: 'unloaddb',
          token: mockHost.token,
          dbname: mockDbname,
          targetdir: request.targetdir,
          target: 'both',
          dbuser: request.dbuser,
          dbpasswd: request.dbpasswd,
        })
      );
      expect(common.checkCmsTokenError).toHaveBeenCalledWith(mockSuccessResponse);
      expect(common.checkCmsStatusError).toHaveBeenCalledWith(mockSuccessResponse);
      expect(result).toEqual(mockSuccessResponse.result);
    });

    it('should successfully unload database with schema only', async () => {
      const request: UnloadDatabaseRequest = {
        ...baseRequest,
        isSchemaIncluded: true,
        isDataIncluded: false,
      };

      cmsClient.postAuthenticated.mockResolvedValue(mockSuccessResponse);

      const result = await service.unloadDatabase(mockUserId, mockHostUid, mockDbname, request);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          target: 'schema',
        })
      );
      expect(result).toEqual(mockSuccessResponse.result);
    });

    it('should successfully unload database with data only', async () => {
      const request: UnloadDatabaseRequest = {
        ...baseRequest,
        isSchemaIncluded: false,
        isDataIncluded: true,
      };

      cmsClient.postAuthenticated.mockResolvedValue(mockSuccessResponse);

      const result = await service.unloadDatabase(mockUserId, mockHostUid, mockDbname, request);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          target: 'object',
        })
      );
      expect(result).toEqual(mockSuccessResponse.result);
    });

    it('should include optional fields in CMS request when provided', async () => {
      const request: UnloadDatabaseRequest = {
        ...baseRequest,
        usehash: 'yes',
        hashdir: '/path/to/hash',
        class: [{ classname: 'test' }],
        ref: 'yes',
        classonly: 'yes',
        'as-dba': 'yes',
        'skip-index-detail': 'yes',
        'split-schema-files': 'yes',
        delimit: 'yes',
        estimate: '1000',
        prefix: 'backup',
        cach: '100',
        lofile: '10',
      };

      cmsClient.postAuthenticated.mockResolvedValue(mockSuccessResponse);

      await service.unloadDatabase(mockUserId, mockHostUid, mockDbname, request);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          usehash: 'yes',
          hashdir: '/path/to/hash',
          class: [{ classname: 'test' }],
          ref: 'yes',
          classonly: 'yes',
          'as-dba': 'yes',
          'skip-index-detail': 'yes',
          'split-schema-files': 'yes',
          delimit: 'yes',
          estimate: '1000',
          prefix: 'backup',
          cach: '100',
          lofile: '10',
        })
      );
    });

    it('should throw InvalidParameter error when both isSchemaIncluded and isDataIncluded are false', async () => {
      const request: UnloadDatabaseRequest = {
        ...baseRequest,
        isSchemaIncluded: false,
        isDataIncluded: false,
      };

      await expect(
        service.unloadDatabase(mockUserId, mockHostUid, mockDbname, request)
      ).rejects.toThrow(DatabaseError);

      await expect(
        service.unloadDatabase(mockUserId, mockHostUid, mockDbname, request)
      ).rejects.toThrow('Both isSchemaIncluded and isDataIncluded cannot be false');

      expect(cmsClient.postAuthenticated).not.toHaveBeenCalled();
    });

    it('should throw HostError when host is not found', async () => {
      hostService.findHostInternal.mockRejectedValue(
        HostError.NoSuchHost({ hostUid: mockHostUid })
      );

      await expect(
        service.unloadDatabase(mockUserId, mockHostUid, mockDbname, baseRequest)
      ).rejects.toThrow(HostError);

      expect(cmsClient.postAuthenticated).not.toHaveBeenCalled();
    });

    it('should throw CmsError when CMS request fails', async () => {
      const cmsError = CmsError.RequestFailed({
        status: 500,
        data: { message: 'Internal server error' },
      });

      cmsClient.postAuthenticated.mockRejectedValue(cmsError);

      await expect(
        service.unloadDatabase(mockUserId, mockHostUid, mockDbname, baseRequest)
      ).rejects.toThrow(CmsError);
    });

    it('should throw DatabaseError when CMS token error is detected', async () => {
      const invalidTokenResponse: UnloadDatabaseCmsResponse = {
        __EXEC_TIME: '0 ms',
        note: 'Invalid token',
        status: 'failed',
        task: 'unloaddb',
        result: [],
      };

      cmsClient.postAuthenticated.mockResolvedValue(invalidTokenResponse);
      (common.checkCmsTokenError as jest.Mock).mockImplementation(() => {
        throw DatabaseError.InvalidParameter('Invalid CMS token');
      });

      await expect(
        service.unloadDatabase(mockUserId, mockHostUid, mockDbname, baseRequest)
      ).rejects.toThrow(DatabaseError);
    });

    it('should throw DatabaseError when CMS status error is detected', async () => {
      const failedResponse: UnloadDatabaseCmsResponse = {
        __EXEC_TIME: '0 ms',
        note: 'Unload failed',
        status: 'failed',
        task: 'unloaddb',
        result: [],
      };

      cmsClient.postAuthenticated.mockResolvedValue(failedResponse);
      (common.checkCmsStatusError as jest.Mock).mockImplementation(() => {
        throw DatabaseError.InvalidParameter('CMS status failed');
      });

      await expect(
        service.unloadDatabase(mockUserId, mockHostUid, mockDbname, baseRequest)
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe('startInfo', () => {
    const mockStartInfoCmsResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'startinfo',
      dblist: [
        {
          dbs: [
            {
              dbname: 'testdb',
              dbdir: '/path/to/testdb',
            },
          ],
        },
      ],
      activelist: [
        {
          active: [{ dbname: 'testdb' }],
        },
      ],
    };

    const mockStartInfoClientResponse = {
      activelist: { active: [{ dbname: 'testdb' }] },
      dblist: {
        dbs: [
          {
            dbname: 'testdb',
            dbdir: '/path/to/testdb',
            isProfileExists: false,
          },
        ],
      },
    };

    it('should return start info with profile existence', async () => {
      const hostWithProfile = {
        ...mockHost,
        dbProfiles: { testdb: { dbname: 'testdb', id: 'dba', password: 'pass' } },
      };
      hostService.findHostInternal.mockResolvedValue(hostWithProfile);
      cmsClient.postAuthenticated.mockResolvedValue(mockStartInfoCmsResponse);

      const result = await service.startInfo(mockUserId, mockHostUid);

      expect(result).toEqual({
        activelist: { active: [{ dbname: 'testdb' }] },
        dblist: {
          dbs: [
            {
              dbname: 'testdb',
              dbdir: '/path/to/testdb',
              isProfileExists: true,
            },
          ],
        },
      });
    });

    it('should return start info without profile', async () => {
      hostService.findHostInternal.mockResolvedValue(mockHost);
      cmsClient.postAuthenticated.mockResolvedValue(mockStartInfoCmsResponse);

      const result = await service.startInfo(mockUserId, mockHostUid);

      expect(result).toEqual(mockStartInfoClientResponse);
    });

    it('should throw DatabaseError when CMS status is fail', async () => {
      const failedResponse = {
        __EXEC_TIME: '0 ms',
        note: 'Failed',
        status: 'fail',
        task: 'startinfo',
      };
      cmsClient.postAuthenticated.mockResolvedValue(failedResponse);

      await expect(service.startInfo(mockUserId, mockHostUid)).rejects.toThrow(DatabaseError);
    });
  });

  describe('startDatabase', () => {
    const mockBaseResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'startdb',
    };

    const mockStartInfoResponse = {
      activelist: { active: [] },
      dblist: { dbs: [] },
    };

    beforeEach(() => {
      jest.spyOn(service, 'startInfo').mockResolvedValue(mockStartInfoResponse);
    });

    it('should successfully start database', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockBaseResponse);

      const result = await service.startDatabase(mockUserId, mockHostUid, mockDbname);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        `https://${mockHost.address}:${mockHost.port}/cm_api`,
        expect.objectContaining({
          task: 'startdb',
          token: mockHost.token,
          dbname: mockDbname,
        })
      );
      expect(common.checkCmsTokenError).toHaveBeenCalled();
      expect(result).toEqual(mockStartInfoResponse);
    });

    it('should throw DatabaseError when CMS status is fail', async () => {
      const failedResponse = {
        ...mockBaseResponse,
        status: 'fail',
        note: 'Database start failed',
      };
      cmsClient.postAuthenticated.mockResolvedValue(failedResponse);

      await expect(service.startDatabase(mockUserId, mockHostUid, mockDbname)).rejects.toThrow(
        DatabaseError
      );
    });
  });

  describe('stopDatabase', () => {
    const mockBaseResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'stopdb',
    };

    const mockStartInfoResponse = {
      activelist: { active: [] },
      dblist: { dbs: [] },
    };

    beforeEach(() => {
      jest.spyOn(service, 'startInfo').mockResolvedValue(mockStartInfoResponse);
    });

    it('should successfully stop database', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockBaseResponse);

      const result = await service.stopDatabase(mockUserId, mockHostUid, mockDbname);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        `https://${mockHost.address}:${mockHost.port}/cm_api`,
        expect.objectContaining({
          task: 'stopdb',
          token: mockHost.token,
          dbname: mockDbname,
        })
      );
      expect(result).toEqual(mockStartInfoResponse);
    });

    it('should throw DatabaseError when CMS status is fail', async () => {
      const failedResponse = {
        ...mockBaseResponse,
        status: 'fail',
        note: 'Database stop failed',
      };
      cmsClient.postAuthenticated.mockResolvedValue(failedResponse);

      await expect(service.stopDatabase(mockUserId, mockHostUid, mockDbname)).rejects.toThrow(
        DatabaseError
      );
    });
  });

  describe('restartDatabase', () => {
    const mockBaseResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'stopdb',
    };

    const mockStartResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'startdb',
    };

    const mockStartInfoResponse = {
      activelist: { active: [] },
      dblist: { dbs: [] },
    };

    beforeEach(() => {
      jest.spyOn(service, 'startInfo').mockResolvedValue(mockStartInfoResponse);
    });

    it('should successfully restart database', async () => {
      cmsClient.postAuthenticated
        .mockResolvedValueOnce(mockBaseResponse) // stop
        .mockResolvedValueOnce(mockStartResponse); // start

      const result = await service.restartDatabase(mockUserId, mockHostUid, mockDbname);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockStartInfoResponse);
    });

    it('should throw DatabaseError when stop fails', async () => {
      const failedResponse = {
        ...mockBaseResponse,
        status: 'fail',
        note: 'Stop failed',
      };
      cmsClient.postAuthenticated.mockResolvedValueOnce(failedResponse);

      await expect(service.restartDatabase(mockUserId, mockHostUid, mockDbname)).rejects.toThrow(
        DatabaseError
      );
    });

    it('should throw DatabaseError when start fails', async () => {
      const failedResponse = {
        ...mockStartResponse,
        status: 'fail',
        note: 'Start failed',
      };
      cmsClient.postAuthenticated
        .mockResolvedValueOnce(mockBaseResponse) // stop succeeds
        .mockResolvedValueOnce(failedResponse); // start fails

      await expect(service.restartDatabase(mockUserId, mockHostUid, mockDbname)).rejects.toThrow(
        DatabaseError
      );
    });
  });

  describe('saveDatabaseProfile', () => {
    const mockStartInfoResponse = {
      activelist: { active: [] },
      dblist: { dbs: [] },
    };

    beforeEach(() => {
      jest.spyOn(service, 'startInfo').mockResolvedValue(mockStartInfoResponse);
    });

    it('should successfully save database profile', async () => {
      const mockUser = {
        id: mockUserId,
        host_list: {
          [mockHostUid]: mockHost,
        },
      };

      repository.atomicUpdateUser.mockImplementation(async (userId, callback) => {
        return await callback(mockUser as any);
      });

      const result = await service.saveDatabaseProfile(
        mockUserId,
        mockHostUid,
        mockDbname,
        'dba',
        'password'
      );

      expect(repository.atomicUpdateUser).toHaveBeenCalled();
      expect(result).toEqual(mockStartInfoResponse);
    });

    it('should throw ValidationError when credentials are missing', async () => {
      await expect(
        service.saveDatabaseProfile(mockUserId, mockHostUid, '', 'dba', 'password')
      ).rejects.toThrow();

      await expect(
        service.saveDatabaseProfile(mockUserId, mockHostUid, mockDbname, '', 'password')
      ).rejects.toThrow();

      await expect(
        service.saveDatabaseProfile(mockUserId, mockHostUid, mockDbname, 'dba', '')
      ).rejects.toThrow();
    });

    it('should throw DatabaseError when profile already exists', async () => {
      const hostWithProfile = {
        ...mockHost,
        dbProfiles: { [mockDbname]: { dbname: mockDbname, id: 'dba', password: 'pass' } },
      };
      const mockUser = {
        id: mockUserId,
        host_list: {
          [mockHostUid]: hostWithProfile,
        },
      };

      repository.atomicUpdateUser.mockImplementation(async (userId, callback) => {
        return await callback(mockUser as any);
      });

      await expect(
        service.saveDatabaseProfile(mockUserId, mockHostUid, mockDbname, 'dba', 'password')
      ).rejects.toThrow(DatabaseError);
    });

    it('should throw HostError when host is not found', async () => {
      const mockUser = {
        id: mockUserId,
        host_list: {},
      };

      repository.atomicUpdateUser.mockImplementation(async (userId, callback) => {
        return await callback(mockUser as any);
      });

      await expect(
        service.saveDatabaseProfile(mockUserId, mockHostUid, mockDbname, 'dba', 'password')
      ).rejects.toThrow(HostError);
    });
  });

  describe('getDBSpaceInfo', () => {
    const mockDbSpaceInfoResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'dbspaceinfo',
      dbname: 'testdb',
      pagesize: '16384',
      logpagesize: '16384',
      freespace: '1048576',
    };

    it('should successfully get database space info', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockDbSpaceInfoResponse);

      const result = await service.getDBSpaceInfo(mockUserId, mockHostUid, mockDbname);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        `https://${mockHost.address}:${mockHost.port}/cm_api`,
        expect.objectContaining({
          task: 'dbspaceinfo',
          token: mockHost.token,
          dbname: mockDbname,
        })
      );
      expect(common.checkCmsTokenError).toHaveBeenCalled();
      expect(common.checkCmsStatusError).toHaveBeenCalled();
      expect(result).toEqual({
        dbname: 'testdb',
        pagesize: '16384',
        logpagesize: '16384',
        freespace: '1048576',
      });
    });
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
      expect(result).toEqual({});
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

  describe('getUnloadInfo', () => {
    const mockResponse = {
      __EXEC_TIME: '0 ms',
      note: 'none',
      status: 'success',
      task: 'unloadinfo',
      database: [
        {
          dbname: 'test4',
          object: '/home/cubrid/CUBRID-11.4.4.1832-7f8f019-Linux.x86_64/databases/test4/test4_objects;2026.01.27 12:17',
          schema: '/home/cubrid/CUBRID-11.4.4.1832-7f8f019-Linux.x86_64/databases/test4/test4_schema;2026.01.27 12:17',
        },
        {
          dbname: 'demodb',
          object: '/home/cubrid/CUBRID-11.4.4.1832-7f8f019-Linux.x86_64/databases/demodb/demodb_objects;2026.01.27 12:02',
          schema: '/home/cubrid/CUBRID-11.4.4.1832-7f8f019-Linux.x86_64/databases/demodb/demodb_schema;2026.01.27 12:02',
        },
      ],
    };

    it('should successfully get unload info', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.getUnloadInfo(mockUserId, mockHostUid);

      expect(hostService.findHostInternal).toHaveBeenCalledWith(mockUserId, mockHostUid);
      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.stringContaining('https://localhost:8001/cm_api'),
        expect.objectContaining({
          task: 'unloadinfo',
          token: 'test-token',
        })
      );
      expect(common.checkCmsTokenError).toHaveBeenCalledWith(mockResponse);
      expect(common.checkCmsStatusError).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual({
        database: mockResponse.database,
      });
    });

    it('should return empty database array when CMS returns empty array', async () => {
      const emptyResponse = {
        __EXEC_TIME: '0 ms',
        note: 'none',
        status: 'success',
        task: 'unloadinfo',
        database: [],
      };
      cmsClient.postAuthenticated.mockResolvedValue(emptyResponse);

      const result = await service.getUnloadInfo(mockUserId, mockHostUid);

      expect(result).toEqual({
        database: [],
      });
    });

    it('should throw DatabaseError when HostError occurs', async () => {
      hostService.findHostInternal.mockRejectedValue(HostError.NoSuchHost());

      await expect(service.getUnloadInfo(mockUserId, mockHostUid)).rejects.toThrow(
        HostError
      );
    });

    it('should throw DatabaseError when CmsError occurs', async () => {
      const cmsError = CmsError.RequestFailed({
        message: 'CMS request failed',
        response: {},
      });
      cmsClient.postAuthenticated.mockRejectedValue(cmsError);

      await expect(service.getUnloadInfo(mockUserId, mockHostUid)).rejects.toThrow(
        CmsError
      );
    });

    it('should throw DatabaseError when CMS token error occurs', async () => {
      const tokenErrorResponse = {
        __EXEC_TIME: '0 ms',
        note: 'Invalid token',
        status: 'fail',
        task: 'unloadinfo',
      };
      cmsClient.postAuthenticated.mockResolvedValue(tokenErrorResponse);
      (common.checkCmsTokenError as jest.Mock).mockImplementation(() => {
        throw CmsError.InvalidToken();
      });

      await expect(service.getUnloadInfo(mockUserId, mockHostUid)).rejects.toThrow(
        CmsError
      );
    });

    it('should throw DatabaseError when CMS status error occurs', async () => {
      const statusErrorResponse = {
        __EXEC_TIME: '0 ms',
        note: 'Request failed',
        status: 'fail',
        task: 'unloadinfo',
      };
      cmsClient.postAuthenticated.mockResolvedValue(statusErrorResponse);
      (common.checkCmsStatusError as jest.Mock).mockImplementation(() => {
        throw CmsError.RequestFailed({
          message: 'CMS request failed: Request failed',
          response: statusErrorResponse,
        });
      });

      await expect(service.getUnloadInfo(mockUserId, mockHostUid)).rejects.toThrow(
        CmsError
      );
    });
  });
});
