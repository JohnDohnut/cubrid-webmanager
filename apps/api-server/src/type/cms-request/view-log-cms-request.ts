import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for viewing log file content.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type ViewLogCmsRequest = BaseCmsRequest & {
  task: 'viewlog';
  path: string;
  start: string;
  end: string;
};
