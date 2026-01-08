import { Module } from '@nestjs/common';
import { HostController } from './host.controller';
import { HostService } from './host.service';
import { UserRepositoryModule } from '@repository';
import { SecurityModule } from '@security';
import { LockModule } from '@lock';

/**
 * Host management module for handling host-related operations.
 * 호스트 관련 작업을 처리하는 호스트 관리 모듈입니다.
 *
 * This module provides host management functionality including host list
 * retrieval, adding new hosts, and host validation. It integrates with
 * the security module for encryption and the lock module for concurrency control.
 *
 * 이 모듈은 호스트 목록 조회, 새 호스트 추가, 호스트 검증을 포함한
 * 호스트 관리 기능을 제공합니다. 암호화를 위한 보안 모듈과 동시성 제어를 위한
 * 락 모듈과 통합됩니다.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
    controllers: [HostController],
    providers: [HostService],
    imports: [UserRepositoryModule, SecurityModule, LockModule],
    exports : [HostService]
})
export class HostModule {}

// Export controllers and services for documentation
export { HostController } from './host.controller';
export { HostService } from './host.service';
