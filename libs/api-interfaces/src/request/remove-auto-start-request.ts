/**
 * Client request for disabling auto-start for a database.
 * Removes database name from the server parameter in configuration file.
 *
 * @category Requests
 * @since 1.0.0
 */
export type RemoveAutoStartRequest = {
  /**
   * Configuration file name (e.g., "cubridconf", "broker.conf")
   */
  confname: string;

  /**
   * Database name to disable auto-start
   */
  dbname: string;
};
