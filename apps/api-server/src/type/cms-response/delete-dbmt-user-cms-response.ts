import { BaseCmsResponse } from './base-cms-response';
import { DbmtDblistItem, DbmtUserlistItem } from './get-dbmt-user-info-cms-response';

export type DeleteDbmtUserCmsResponse = BaseCmsResponse & {
  task: 'deletedbmtuser';
  dblist?: DbmtDblistItem[];
  userlist?: DbmtUserlistItem[];
};
