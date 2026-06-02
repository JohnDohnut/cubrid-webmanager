import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { CmsAuthService } from '@cms-auth/cms-auth.service';
import { UserRepositoryService } from '@repository';

describe('FileService', () => {
  let service: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        { provide: CmsHttpsClientService, useValue: {} },
        { provide: CmsAuthService, useValue: {} },
        { provide: UserRepositoryService, useValue: {} },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
