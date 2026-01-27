import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for getting unload information.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type UnloadInfoCmsRequest = BaseCmsRequest & {
  /**
   * Task type - must be 'unloadinfo'
   */
  task: 'unloadinfo';
};
