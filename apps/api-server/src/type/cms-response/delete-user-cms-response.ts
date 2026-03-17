import { BaseCmsResponse } from './base-cms-response';

/**
 * CMS response for deleteuser task.
 */
export type DeleteUserCmsResponse = BaseCmsResponse & {
  task: 'deleteuser';
};
