/**
 * Database unload information entry.
 * 
 * @category Responses
 * @since 1.0.0
 */
export type UnloadInfoDatabaseEntry = {
  /**
   * Database name
   */
  dbname: string;

  /**
   * Object file path with timestamp
   */
  object: string;

  /**
   * Schema file path with timestamp
   */
  schema: string;
};

/**
 * Response type for unload information.
 * Returns domain-only data (CMS envelope removed).
 * 
 * @category Responses
 * @since 1.0.0
 */
export type UnloadInfoClientResponse = {
  /**
   * Array of database unload information
   */
  database: UnloadInfoDatabaseEntry[];
};
