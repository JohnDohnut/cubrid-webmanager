import { BaseCmsResponse } from './base-cms-response';

/**
 * CMS response for restoredb task.
 */
export type RestoreDbCmsResponse = BaseCmsResponse & {
  task: 'restoredb';
};

