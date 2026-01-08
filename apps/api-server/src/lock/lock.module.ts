import { Module } from '@nestjs/common';
import { LockService } from './lock.service';

/**
 * Module for managing file locking functionalities.
 *
 * 파일 잠금 기능을 관리하기 위한 모듈입니다.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
    providers: [LockService],
    exports: [LockService],
})
export class LockModule {}
