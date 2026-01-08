import { Module } from '@nestjs/common';
import { ConfigModule } from '@config/config.module';
import { UserRepositoryModule } from '@repository';
import { SecurityModule } from '@security';
import { TokenModule } from '@token';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * Authentication module for handling user login and registration.
 * 사용자 로그인 및 등록을 처리하기 위한 인증 모듈입니다.
 *
 * This module provides authentication functionality including user login,
 * registration, and JWT token generation. It integrates with the security
 * module for password hashing and the token module for JWT management.
 *
 * 이 모듈은 사용자 로그인, 등록 및 JWT 토큰 생성을 포함한 인증 기능을 제공합니다.
 * 비밀번호 해싱을 위한 보안 모듈 및 JWT 관리를 위한 토큰 모듈과 통합됩니다.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [SecurityModule, ConfigModule, UserRepositoryModule, TokenModule],
    exports: [],
})
export class AuthModule {}

// Export controllers and services for documentation
export { AuthController } from './auth.controller';
export { AuthService } from './auth.service';
