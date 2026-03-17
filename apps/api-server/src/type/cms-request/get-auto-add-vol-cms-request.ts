import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for getautoaddvol task.
 */
export type GetAutoAddVolCmsRequest = BaseCmsRequest & {
  task: 'getautoaddvol';
  dbname: string;
};
