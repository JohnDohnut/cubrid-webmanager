/**
 * Client request for creating a database user (createuser).
 */
export type CreateDbUserRequest = {
  dbname: string;
  username: string;
  userpass: string;
  groups: { group: string[] };
  authorization: unknown[];
};
