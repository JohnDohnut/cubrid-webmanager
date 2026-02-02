/**
 * Client request for enabling auto-start for a database.
 * Adds database name to the server parameter in configuration file.
 *
 * @category Requests
 * @since 1.0.0
 */
export type SetAutoStartRequest = {
  /**
   * Configuration file name (e.g., "cubridconf", "broker.conf")
   */
  confname: string;

  /**
   * Database name to enable auto-start
   */
  dbname: string;
};
