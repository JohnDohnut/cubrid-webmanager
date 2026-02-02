import { BaseCmsResponse } from './base-cms-response';

/**
 * Response type for updateuser task.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type UpdateUserCmsResponse = BaseCmsResponse & {
  /**
   * Task type - must be 'updateuser'
   */
  task: 'updateuser';
};
