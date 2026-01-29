import { BaseCmsRequest } from './base-cms-request';

/**
 * Represents a CMS request specifically for checking a file.
 * Extends BaseCmsRequest and sets the task to 'checkfile'.
 *
 * @category Requests
 * @since 1.0.0
 */
export type CheckFileCmsRequest = BaseCmsRequest & {
  task: 'checkfile';
  file?: string[];
};
