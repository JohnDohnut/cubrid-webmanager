import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption/encryption.service';
import { ConfigModule } from '@config/config.module';
import { PasswordService } from './password/password.service';
import { PassportModule } from '@nestjs/passport';

/**
 * Module for managing security-related functionalities.
 *
 * 보안 관련 기능을 관리하기 위한 모듈입니다.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
    imports: [ConfigModule, PassportModule],
    exports: [EncryptionService, PasswordService],
    providers: [EncryptionService, PasswordService],
})
export class SecurityModule {}
