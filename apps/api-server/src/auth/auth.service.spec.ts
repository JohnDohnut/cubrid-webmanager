import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@config/config.service';
import { PasswordService } from '@security';
import { UserRepositoryService } from '@repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepositoryService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: PasswordService, useValue: {} },
        {
          provide: ConfigService,
          useValue: {
            isAuthRegistrationEnabled: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
