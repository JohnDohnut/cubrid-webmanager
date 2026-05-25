import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS `ha_stop` request body (`token` is merged in by `BaseService.executeCmsRequest`).
 */
export type HaStopDatabaseCmsRequest = BaseCmsRequest & {
  task: 'ha_stop';
  dbname: string;
};
