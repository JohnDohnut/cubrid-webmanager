export type DbmtDblistItem = { dbs: Array<{ dbname: string }> };
export type DbmtUserlistItem = { user: Array<Record<string, unknown>> };

/**
 * Client response for getdbmtuserinfo (domain data only).
 */
export type GetDbmtUserInfoClientResponse = {
  dblist: DbmtDblistItem[];
  userlist: DbmtUserlistItem[];
};
