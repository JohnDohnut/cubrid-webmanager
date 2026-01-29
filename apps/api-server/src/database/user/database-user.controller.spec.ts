import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseUserController } from './database-user.controller';
import { DatabaseUserService } from './database-user.service';

describe('DatabaseUserController', () => {
  let controller: DatabaseUserController;
  let service: DatabaseUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatabaseUserController],
      providers: [
        {
          provide: DatabaseUserService,
          useValue: {
            getDatabaseUsers: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DatabaseUserController>(DatabaseUserController);
    service = module.get<DatabaseUserService>(DatabaseUserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
