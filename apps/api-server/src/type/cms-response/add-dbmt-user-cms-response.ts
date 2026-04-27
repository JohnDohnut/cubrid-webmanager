import { BaseCmsResponse } from './base-cms-response';

/** DB list item in adddbmtuser response */
export type AddDbmtUserDblistItem = {
  dbs: Array<{ dbname: string }>;
};

/** User list item in adddbmtuser response (per broker) */
export type AddDbmtUserUserlistItem = {
  user: Array<Record<string, unknown>>;
};

/**
 * CMS response for adddbmtuser task.
 */
export type AddDbmtUserCmsResponse = BaseCmsResponse & {
  task: 'adddbmtuser';
  dblist?: AddDbmtUserDblistItem[];
  userlist?: AddDbmtUserUserlistItem[];
};
