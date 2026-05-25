/**
 * Client request type for getbackuplist (backup list by database).
 *
 * @category Client Requests
 * @since 1.0.0
 */
export type BackupDbListClientRequest = {
  /**
   * Database name
   */
  dbname: string;
};

