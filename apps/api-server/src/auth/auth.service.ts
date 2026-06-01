import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { ConfigService } from '@config/config.service';
import { PasswordService } from '@security';
import { User, UserDTO } from '@type/index';
import { UserRepositoryService } from '@repository';
import { AuthError } from '@error/auth/auth-error';
import { UserError } from '@error/user/user-error';
import { HandleAuthErrors } from '@common';
import { passwordValidityChecker } from '@util';
import { AuthTokens, CreateLoginResponse } from '@api-interfaces';
import {
  ACCESS_TOKEN_EXPIRES,
  ACCESS_TOKEN_EXPIRES_SEC,
} from '@token/token.constants';
import { RefreshTokenService } from '@token/refresh-token.service';
import { TokenBlacklistService } from '@token/token-blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UserRepositoryService,
    private readonly jwt: JwtService,
    private readonly password: PasswordService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly tokenBlacklistService: TokenBlacklistService
  ) {}

  @HandleAuthErrors()
  async login(dto: UserDTO): Promise<AuthTokens> {
    const user: User | null = await this.usersRepo.loadUserById(dto.id);
    if (!user) {
      throw UserError.UserNotFound({ userId: dto.id });
    }

    const ok = await this.password.comparePlainAndHash(dto.password, user.password);
    if (!ok) {
      throw UserError.UserNotFound({ userId: dto.id });
    }

    return this.issueTokenPair(user.id);
  }

  @HandleAuthErrors()
  async refresh(refreshToken: string): Promise<AuthTokens> {
    const record = await this.refreshTokenService.find(refreshToken);
    if (!record) {
      throw AuthError.InvalidToken({ reason: 'REFRESH_TOKEN_INVALID' });
    }

    await this.refreshTokenService.revoke(refreshToken);
    return this.issueTokenPair(record.userId, record.familyId);
  }

  @HandleAuthErrors()
  async logout(
    accessJti: string | undefined,
    accessExp: number | undefined,
    refreshToken?: string
  ): Promise<void> {
    if (accessJti && accessExp) {
      await this.tokenBlacklistService.add(accessJti, new Date(accessExp * 1000));
    }
    if (refreshToken) {
      await this.refreshTokenService.revoke(refreshToken);
    }
  }

  @HandleAuthErrors()
  async register(dto: UserDTO): Promise<void> {
    if (!this.configService.isAuthRegistrationEnabled()) {
      throw AuthError.PermissionDenied({ reason: 'AUTH_REGISTRATION_DISABLED' });
    }

    if (!passwordValidityChecker(dto.password)) {
      throw UserError.BadNewPassword({ userId: dto.id });
    }

    await this.usersRepo.createUser(dto);
  }

  private async issueTokenPair(userId: string, familyId?: string): Promise<AuthTokens> {
    const jti = randomUUID();
    const token = await this.jwt.signAsync(
      { sub: userId, jti, type: 'access' },
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );
    const { token: refreshToken } = await this.refreshTokenService.create(userId, familyId);
    return CreateLoginResponse(token, refreshToken, ACCESS_TOKEN_EXPIRES_SEC);
  }
}
