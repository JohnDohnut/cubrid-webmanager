import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for getbackuplist task.
 */
export type GetBackupListCmsRequest = BaseCmsRequest & {
  task: 'getbackuplist';
  dbname: string;
};
