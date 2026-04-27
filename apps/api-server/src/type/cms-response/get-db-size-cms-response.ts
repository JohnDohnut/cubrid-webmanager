import { BaseCmsResponse } from './base-cms-response';

/**
 * CMS response for getdbsize task.
 */
export type GetDbSizeCmsResponse = BaseCmsResponse & {
  task: 'getdbsize';
  /** Database size in bytes (string). */
  dbsize?: string;
};
