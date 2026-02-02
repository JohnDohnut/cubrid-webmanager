/**
 * Client request type for updating a database user.
 *
 * @category Client Requests
 * @since 1.0.0
 */
export type UpdateDbUserRequest = {
  /**
   * Database name
   */
  dbname: string;

  /**
   * Username to update
   */
  username: string;

  /**
   * User password
   */
  userpass: string;

  /**
   * Groups object containing group array
   */
  groups: {
    group: string[];
  };

  /**
   * Authorization array
   */
  authorization: string[];
};
