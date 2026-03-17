import { BaseCmsResponse } from './base-cms-response';

/**
 * Single backup level entry from CMS.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type BackupLevelEntryCms = {
  data: string;
  path: string;
  size: string;
};

/**
 * Response type for backupdbinfo. level0, level1, level2 may be empty arrays.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type BackupDbInfoCmsResponse = BaseCmsResponse & {
  dbdir: string;
  freespace: string;
  level0: BackupLevelEntryCms[];
  level1: BackupLevelEntryCms[];
  level2: BackupLevelEntryCms[];
};
