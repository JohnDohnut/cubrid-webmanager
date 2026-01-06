import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserRepositoryModule } from '@repository';
import { SecurityModule } from '@security';
import { UserService } from './user.service';
import { TokenModule } from '@token';

/**
 * User management module for handling user-related operations.
 * 사용자 관련 작업을 처리하기 위한 사용자 관리 모듈입니다.
 *
 * This module provides user management functionality including user data
 * retrieval, password changes, account updates, and user deletion.
 * It integrates with the security module for password operations.
 *
 * 이 모듈은 사용자 데이터 검색, 비밀번호 변경, 계정 업데이트 및 사용자 삭제를 포함한
 * 사용자 관리 기능을 제공합니다. 비밀번호 작업을 위한 보안 모듈과 통합됩니다.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
    controllers: [UserController],
    providers: [UserService],
    imports: [UserRepositoryModule, SecurityModule, TokenModule],
    exports: [UserService],
})
export class UserModule {}

// Export controllers and services for documentation
export { UserController } from './user.controller';
export { UserService } from './user.service';
