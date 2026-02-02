import { CreateDatabaseClientRequest } from './create-database-client-request';
import { SetAutoAddVolRequest } from './set-auto-add-vol-request';

/**
 * Client request type for creating a database with optional configuration.
 * Combines database creation, user update, auto-add volume, and auto-start settings.
 * Simplified version for createDatabase endpoint - reuses top-level dbname and username.
 *
 * @category Client Requests
 * @since 1.0.0
 */
export type CreateDatabaseWithConfigRequest = CreateDatabaseClientRequest & {
  /**
   * Optional: Username for user update (defaults to "dba" if not provided)
   * Used when updateUser is specified
   */
  username?: string;

  /**
   * Optional: Update database user password after creation
   * Uses top-level dbname and username (or "dba" as default)
   */
  updateUser?: {
    /**
     * User password to set
     */
    userpass: string;
  };

  /**
   * Optional: Set auto-add volume configuration after creation
   */
  setAutoAddVol?: SetAutoAddVolRequest;

  /**
   * Optional: Enable auto-start after creation
   * Uses top-level dbname and automatically uses "cubridconf" as confname
   */
  setAutoStart?: boolean;
};
