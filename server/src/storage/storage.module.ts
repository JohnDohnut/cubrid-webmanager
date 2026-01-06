import { Module } from '@nestjs/common';
import { ConfigModule } from '@config/config.module';
import { StorageService } from './storage.service';
import { SecurityModule } from '@security/security.module';
import { LockModule } from '@lock/lock.module';

/**
 * Module for managing file storage functionalities.
 *
 * 파일 저장소 기능을 관리하기 위한 모듈입니다.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
    imports: [ConfigModule, SecurityModule, LockModule],
    exports: [StorageService],
    providers: [StorageService],
})
export class StorageModule {}
