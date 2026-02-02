import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseLifecycleService } from './database-lifecycle.service';
import { HostService } from '@host';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { UserRepositoryService } from '@repository';
import { CmsConfigService } from '@cms-config/cms-config.service';
import { FileService } from '@file/file.service';
import { DatabaseError } from '@error/database/database-error';
import { HostError } from '@error/index';
import * as common from '@common';

// Mock the checkCmsTokenError and checkCmsStatusError functions
jest.mock('@common', () => ({
  ...jest.requireActual('@common'),
  checkCmsTokenError: jest.fn(),
  checkCmsStatusError: jest.fn(),
}));

describe('DatabaseLifecycleService', () => {
  let service: DatabaseLifecycleService;
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
        DatabaseLifecycleService,
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

    service = module.get<DatabaseLifecycleService>(DatabaseLifecycleService);
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
      const mockStartInfoResponse = {
        __EXEC_TIME: '10 ms',
        note: 'none',
        status: 'success',
        task: 'startinfo',
        dblist: [
          {
            dbs: [{ dbname: mockDbname }],
          },
        ],
        activelist: [{ active: [] }],
      };

      cmsClient.postAuthenticated
        .mockResolvedValueOnce(mockStartInfoResponse) // startinfo check
        .mockResolvedValueOnce(mockDbSpaceInfoResponse); // dbspaceinfo

      const result = await service.getDBSpaceInfo(mockUserId, mockHostUid, mockDbname);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledTimes(2);
      expect(common.checkCmsTokenError).toHaveBeenCalled();
      expect(result).toEqual({
        dbname: 'testdb',
        pagesize: '16384',
        logpagesize: '16384',
        freespace: '1048576',
      });
    });
  });
});
