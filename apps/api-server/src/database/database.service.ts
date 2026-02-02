import { Injectable } from '@nestjs/common';

/**
 * @deprecated This service has been split into specialized services:
 * - DatabaseLifecycleService (lifecycle operations)
 * - DatabaseBackupService (backup operations)
 * - DatabaseUnloadService (unload operations)
 * - DatabaseConfigService (configuration operations)
 *
 * This file is kept for backward compatibility but should not be used for new code.
 * All functionality has been moved to the respective specialized services.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class DatabaseService {
  // This service is deprecated and all methods have been moved to specialized services
}
