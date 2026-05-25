import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for getdbsize task.
 */
export type GetDbSizeCmsRequest = BaseCmsRequest & {
  task: 'getdbsize';
  dbname: string;
};
