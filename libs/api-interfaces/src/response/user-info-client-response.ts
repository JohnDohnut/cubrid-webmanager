/** Single user entry in userinfo response */
export type UserInfoUserEntry = {
  '@id'?: string;
  '@name'?: string;
  authorization?: Record<string, string>[] | null;
  groups?: unknown | null;
};

/**
 * Client response for userinfo (domain data only).
 */
export type UserInfoClientResponse = {
  dbname: string;
  user: UserInfoUserEntry[];
};
