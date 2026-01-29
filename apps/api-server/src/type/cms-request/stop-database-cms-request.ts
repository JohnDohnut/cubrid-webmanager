import { BaseCmsRequest } from './base-cms-request';

export type StopDatabaseCmsRequest = BaseCmsRequest & {
  dbname: string;
};
