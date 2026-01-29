import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for database statistics dump (statdump).
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type StatdumpCmsRequest = BaseCmsRequest & {
  /**
   * Host unique identifier
   */
  hostUid: string;

  /**
   * Task type - must be 'statdump'
   */
  task: 'statdump';

  /**
   * Database name to retrieve statistics for
   */
  dbname: string;
};
