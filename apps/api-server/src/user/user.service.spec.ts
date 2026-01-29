import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepositoryService } from '@repository';
import { PasswordService } from '@security';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepositoryService>;
  let passwordService: jest.Mocked<PasswordService>;

  beforeEach(async () => {
    // TODO: Create mock objects and set up TestingModule
    const mockRepository = {
      loadUserById: jest.fn(),
      atomicUpdateUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    const mockPasswordService = {
      comparePlainAndHash: jest.fn(),
      getHashedValue: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepositoryService,
          useValue: mockRepository,
        },

        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
      ],
    }).compile();

    ((service = module.get<UserService>(UserService)),
      (repository = module.get(UserRepositoryService)),
      (passwordService = module.get(PasswordService)));
  });

  // TODO: Write test cases
});
