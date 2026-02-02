import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for updating a database user.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type UpdateUserCmsRequest = BaseCmsRequest & {
  /**
   * Task type - must be 'updateuser'
   */
  task: 'updateuser';

  /**
   * Database name
   */
  dbname: string;

  /**
   * Username to update
   */
  username: string;

  /**
   * User password
   */
  userpass: string;

  /**
   * Groups object containing group array
   */
  groups: {
    group: string[];
  };

  /**
   * Authorization array
   */
  authorization: string[];
};
