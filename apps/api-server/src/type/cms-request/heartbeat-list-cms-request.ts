import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for getting heartbeat list.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type HeartbeatListCmsRequest = BaseCmsRequest & {
  /**
   * Task type - must be 'heartbeatlist'
   */
  task: 'heartbeatlist';

  /**
   * Whether to get all database modes
   * Values: "y" | "n"
   */
  dbmodeall?: 'y' | 'n';
};
