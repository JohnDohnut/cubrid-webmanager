import { BaseCmsResponse } from './base-cms-response';

/**
 * Single backup level entry from CMS list response.
 */
export type BackupLevelEntryListCms = {
  data: string;
  path: string;
  size: string;
};

/**
 * CMS response for getbackuplist task.
 *
 * Note: CMS may return 'none' strings (when no backups exist) or arrays.
 */
export type GetBackupListCmsResponse = BaseCmsResponse & {
  task: 'getbackuplist';
  level0: BackupLevelEntryListCms[] | 'none' | string;
  level1: BackupLevelEntryListCms[] | 'none' | string;
  level2: BackupLevelEntryListCms[] | 'none' | string;
};
