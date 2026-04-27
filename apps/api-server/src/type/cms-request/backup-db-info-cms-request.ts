import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for backupdbinfo task.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type BackupDbInfoCmsRequest = BaseCmsRequest & {
  task: 'backupdbinfo';
  dbname: string;
};
