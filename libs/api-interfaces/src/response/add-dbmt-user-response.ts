/** DB list item in adddbmtuser response */
export type AddDbmtUserDblistItem = {
  dbs: Array<{ dbname: string }>;
};

/** User list item in adddbmtuser response (per broker) */
export type AddDbmtUserUserlistItem = {
  user: Array<Record<string, unknown>>;
};

/**
 * Client response for adddbmtuser (domain data only).
 */
export type AddDbmtUserClientResponse = {
  dblist: AddDbmtUserDblistItem[];
  userlist: AddDbmtUserUserlistItem[];
};
