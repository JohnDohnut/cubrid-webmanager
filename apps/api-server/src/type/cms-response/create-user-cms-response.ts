import { BaseCmsResponse } from './base-cms-response';

/**
 * CMS response for createuser task.
 */
export type CreateUserCmsResponse = BaseCmsResponse & {
  task: 'createuser';
};
