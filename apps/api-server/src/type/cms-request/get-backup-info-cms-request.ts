import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for getting backup information.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type GetBackupInfoCmsRequest = BaseCmsRequest & {
  /**
   * Task type - must be 'getbackupinfo'
   */
  task: 'getbackupinfo';

  /**
   * Database name
   */
  dbname: string;
};
