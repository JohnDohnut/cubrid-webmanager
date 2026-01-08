import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseUserService } from './database-user.service';

describe('DatabaseUserService', () => {
  let service: DatabaseUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseUserService],
    }).compile();

    service = module.get<DatabaseUserService>(DatabaseUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

