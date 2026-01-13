import { Module } from '@nestjs/common';
import { HostController } from './host.controller';
import { HostService } from './host.service';
import { UserRepositoryModule } from '@repository';
import { SecurityModule } from '@security';
import { LockModule } from '@lock';

/**
 * Host management module for handling host-related operations.
 *
 * This module provides host management functionality including host list
 * retrieval, adding new hosts, and host validation. It integrates with
 * the security module for encryption and the lock module for concurrency control.
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
