import { BaseCmsResponse } from './base-cms-response';

/**
 * Database unload information entry.
 * 
 * @category CMS Responses
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
 * Response type for unloadinfo task.
 * 
 * @category CMS Responses
 * @since 1.0.0
 */
export type UnloadInfoCmsResponse = BaseCmsResponse & {
  /**
   * Array of database unload information
   */
  database: UnloadInfoDatabaseEntry[];
};
