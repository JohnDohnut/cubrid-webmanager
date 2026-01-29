import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for getting auto-execution query.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type GetAutoExecQueryCmsRequest = BaseCmsRequest & {
  /**
   * Task type - must be 'getautoexecquery'
   */
  task: 'getautoexecquery';

  /**
   * Database name
   */
  dbname: string;
};
