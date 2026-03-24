import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for restoredb task.
 */
export type RestoreDbCmsRequest = BaseCmsRequest & {
  task: 'restoredb';
  /** Database name */
  dbname: string;
  /** Restore date or "none" */
  date: string;
  /** Backup level */
  level: string;
  /** Partial recovery flag */
  partial: string;
  /** Backup file path */
  pathname: string;
  /** Recovery path */
  recoverypath: string;
};

