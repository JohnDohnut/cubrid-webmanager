import { BaseCmsResponse } from './base-cms-response';

/**
 * CMS response for userverify task.
 */
export type UserVerifyCmsResponse = BaseCmsResponse & {
  task: 'userverify';
};
