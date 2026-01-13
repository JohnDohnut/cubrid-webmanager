import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for getting admin log information.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type GetAdminLogInfoCmsRequest = BaseCmsRequest & {
    /**
     * Task type - must be 'getadminloginfo'
     */
    task: 'getadminloginfo';
};

