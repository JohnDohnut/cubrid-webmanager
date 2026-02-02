import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { HostService } from '@host';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { UserRepositoryService } from '@repository';
import { CmsConfigService } from '@cms-config/cms-config.service';
import { FileService } from '@file/file.service';

/**
 * @deprecated This test file has been split into specialized test files:
 * - database-lifecycle.service.spec.ts (lifecycle operations)
 * - database-backup.service.spec.ts (backup operations)
 * - database-management.service.spec.ts (management operations: unload, load, optimize, check, etc.)
 * - database-config.service.spec.ts (configuration operations)
 *
 * This file is kept for backward compatibility but should not be used for new tests.
 * All tests have been moved to the respective specialized test files.
 */
describe('DatabaseService (Deprecated)', () => {
  let service: DatabaseService;

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // All tests have been moved to specialized test files
  // See: database-lifecycle.service.spec.ts, database-backup.service.spec.ts,
  //      database-management.service.spec.ts, database-config.service.spec.ts
});
