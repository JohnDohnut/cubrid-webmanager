import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for loading access log.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type LoadAccessLogCmsRequest = BaseCmsRequest & {
    task: 'loadaccesslog';
};

