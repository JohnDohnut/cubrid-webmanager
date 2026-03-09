import { BaseCmsResponse } from './base-cms-response';

/** DB list item in updatedbmtuser response */
export type UpdateDbmtUserDblistItem = {
  dbs: Array<{ dbname: string }>;
};

/** User list item in updatedbmtuser response (per broker) */
export type UpdateDbmtUserUserlistItem = {
  user: Array<Record<string, unknown>>;
};

/**
 * CMS response for updatedbmtuser task.
 */
export type UpdateDbmtUserCmsResponse = BaseCmsResponse & {
  task: 'updatedbmtuser';
  dblist?: UpdateDbmtUserDblistItem[];
  userlist?: UpdateDbmtUserUserlistItem[];
};
