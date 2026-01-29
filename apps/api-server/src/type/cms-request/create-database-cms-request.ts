import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for creating a database.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type CreateDatabaseCmsRequest = BaseCmsRequest & {
  /**
   * Task type - must be 'createdb'
   */
  task: 'createdb';

  /**
   * Database name to create
   */
  dbname: string;

  /**
   * Number of pages for the database
   */
  numpage: string;

  /**
   * Page size in bytes
   */
  pagesize: string;

  /**
   * Log size
   */
  logsize: string;

  /**
   * Log page size in bytes
   */
  logpagesize: string;

  /**
   * General volume path
   */
  genvolpath: string;

  /**
   * Log volume path
   */
  logvolpath: string;

  /**
   * Extended volumes array
   *
   * Format: Array containing a single object with volume name as key and "type;size;path" as value
   *
   * Example:
   * [
   *   {
   *     "dbname_data_x001": "data;32768;/path/to/dbname",
   *     "dbname_index_x001": "index;32768;/path/to/dbname",
   *     "dbname_temp_x001": "temp;32768;/path/to/dbname"
   *   }
   * ]
   */
  exvol: Array<Record<string, string>>;

  /**
   * Character set for the database
   *
   * Example: "ko_KR.utf8", "en_US.utf8"
   */
  charset: string;

  /**
   * Whether to overwrite config file
   *
   * Values: "YES" | "NO"
   */
  overwrite_config_file: string;
};
