import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepositoryService } from '@repository';
import { PasswordService } from '@security';

describe('UserService', () => {
    let service: UserService;
    let repository: jest.Mocked<UserRepositoryService>;
    let passwordService: jest.Mocked<PasswordService>;

    beforeEach(async () => {
        // TODO: Mock 객체 생성 및 TestingModule 설정
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
                    provide : PasswordService,
                    useValue: mockPasswordService,
                }
            ],
        }).compile();

        service = module.get<UserService>(UserService),
        repository = module.get(UserRepositoryService),
        passwordService = module.get(PasswordService)
    });

    // TODO: 테스트 케이스 작성

    
});
