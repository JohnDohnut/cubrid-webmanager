import { BaseCmsResponse } from './base-cms-response';

export type DbmtDblistItem = { dbs: Array<{ dbname: string }> };
export type DbmtUserlistItem = { user: Array<Record<string, unknown>> };

/**
 * CMS response for getdbmtuserinfo, updatedbmtuser, deletedbmtuser (same shape).
 */
export type GetDbmtUserInfoCmsResponse = BaseCmsResponse & {
  task: 'getdbmtuserinfo';
  dblist?: DbmtDblistItem[];
  userlist?: DbmtUserlistItem[];
};
