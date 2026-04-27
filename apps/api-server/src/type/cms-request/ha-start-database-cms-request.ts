import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS `ha_start` request body (`token` is merged in by `BaseService.executeCmsRequest`).
 */
export type HaStartDatabaseCmsRequest = BaseCmsRequest & {
  task: 'ha_start';
  dbname: string;
};
