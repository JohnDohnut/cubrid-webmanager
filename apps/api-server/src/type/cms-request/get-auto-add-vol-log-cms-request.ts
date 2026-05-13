import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for getautoaddvollog task.
 */
export type GetAutoAddVolLogCmsRequest = BaseCmsRequest & {
  task: 'getautoaddvollog';
  start_time: string;
  end_time: string;
};
