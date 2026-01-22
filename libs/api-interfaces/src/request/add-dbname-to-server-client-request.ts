/**
 * Client request for adding a database name to the server parameter in configuration file.
 *
 * @category Requests
 * @since 1.0.0
 */
export type AddDbnameToServerClientRequest = {
    /**
     * Configuration file name (e.g., "cubridconf", "broker.conf")
     */
    confname: string;

    /**
     * Database name to add to the server parameter
     */
    dbname: string;
};
