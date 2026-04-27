import { BaseCmsResponse } from './base-cms-response';

/**
 * CMS response for copydb task.
 */
export type CopyDbCmsResponse = BaseCmsResponse & {
  task: 'copydb';
};
