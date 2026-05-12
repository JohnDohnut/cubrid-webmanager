import { BaseCmsResponse } from './base-cms-response';

export type AutoAddVolLogEntry = {
  dbname: string;
  volname: string;
  purpose: string;
  page: string;
  time: string;
  outcome: string;
};

/**
 * CMS response for getautoaddvollog task.
 */
export type GetAutoAddVolLogCmsResponse = BaseCmsResponse & {
  task: 'getautoaddvollog';
  log?: AutoAddVolLogEntry[] | null;
};
