import { BaseCmsResponse } from './base-cms-response';

/**
 * Result entry for unloaddb task.
 * Each entry contains class names as keys and their unload progress as values.
 *
 * Example:
 * {
 *   "dba.test": "0 (100%/100%)",
 *   "dba.test2": "0 (100%/100%)",
 *   "dba.test3": "0 (100%/100%)"
 * }
 */
export type UnloadResultEntry = {
  /**
   * Class name as key, unload progress as value.
   * Format: "{count} ({percentage}%)"
   * Example: "0 (100%/100%)"
   */
  [className: string]: string;
};

/**
 * Response type for unloaddb task.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type UnloadDatabaseCmsResponse = BaseCmsResponse & {
  /**
   * Array of unload results.
   * Each element contains class names and their unload progress information.
   */
  result: UnloadResultEntry[];
};
