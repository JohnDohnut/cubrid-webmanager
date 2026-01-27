/**
 * Client request for removing a database name from the server parameter in configuration file.
 *
 * @category Requests
 * @since 1.0.0
 */
export type RemoveDbnameFromServerClientRequest = {
  /**
   * Configuration file name (e.g., "cubridconf", "broker.conf")
   */
  confname: string;

  /**
   * Database name to remove from the server parameter
   */
  dbname: string;
};
