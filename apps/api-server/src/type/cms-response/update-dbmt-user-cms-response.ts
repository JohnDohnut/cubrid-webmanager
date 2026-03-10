import { BaseCmsResponse } from './base-cms-response';
import { DbmtDblistItem, DbmtUserlistItem } from './get-dbmt-user-info-cms-response';

export type UpdateDbmtUserCmsResponse = BaseCmsResponse & {
  task: 'updatedbmtuser';
  dblist?: DbmtDblistItem[];
  userlist?: DbmtUserlistItem[];
};
