import { Module } from '@nestjs/common';
import { SecurityModule } from '@security/security.module';
import { StorageModule } from '@storage/storage.module';
import { UserRepositoryService } from './user-repository/user-repository.service';
import { LockModule } from '@lock/lock.module';

/**
 * Module for managing user repository operations.
 *
 * 사용자 리포지토리 작업을 관리하기 위한 모듈입니다.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
    providers: [UserRepositoryService],
    imports: [SecurityModule, StorageModule, LockModule],
    exports: [UserRepositoryService],
})
export class UserRepositoryModule {}
