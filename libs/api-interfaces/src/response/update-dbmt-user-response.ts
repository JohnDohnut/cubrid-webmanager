/** DB list item in updatedbmtuser response */
export type UpdateDbmtUserDblistItem = {
  dbs: Array<{ dbname: string }>;
};

/** User list item in updatedbmtuser response (per broker) */
export type UpdateDbmtUserUserlistItem = {
  user: Array<Record<string, unknown>>;
};

/**
 * Client response for updatedbmtuser (domain data only).
 */
export type UpdateDbmtUserClientResponse = {
  dblist: UpdateDbmtUserDblistItem[];
  userlist: UpdateDbmtUserUserlistItem[];
};
