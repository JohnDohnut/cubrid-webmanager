import { Controller } from '@nestjs/common';

/**
 * @deprecated This controller has been split into specialized controllers:
 * - DatabaseLifecycleController (lifecycle operations)
 * - DatabaseBackupController (backup operations)
 * - DatabaseUnloadController (unload operations)
 * - DatabaseConfigController (configuration operations)
 *
 * This file is kept for backward compatibility but should not be used for new code.
 * All endpoints have been moved to the respective specialized controllers.
 *
 * @category Controllers
 * @since 1.0.0
 */
@Controller(':hostUid/database')
export class DatabaseController {
  // This controller is deprecated and all endpoints have been moved to specialized controllers
}
