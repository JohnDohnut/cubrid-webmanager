import { CreateDatabaseClientRequest } from './create-database-client-request';
import { UpdateDbUserRequest } from './update-db-user-request';
import { SetAutoAddVolRequest } from './set-auto-add-vol-request';
import { SetAutoStartRequest } from './set-auto-start-request';

/**
 * Client request type for creating a database with optional configuration.
 * Combines database creation, user update, auto-add volume, and auto-start settings.
 *
 * @category Client Requests
 * @since 1.0.0
 */
export type CreateDatabaseWithConfigRequest = CreateDatabaseClientRequest & {
  /**
   * Optional: Update database user after creation
   */
  updateUser?: UpdateDbUserRequest;

  /**
   * Optional: Set auto-add volume configuration after creation
   */
  setAutoAddVol?: SetAutoAddVolRequest;

  /**
   * Optional: Enable auto-start after creation
   */
  setAutoStart?: SetAutoStartRequest;
};
