import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for getting environment information.
 */
export type GetEnvCmsRequest = BaseCmsRequest & {
    task: 'getenv';
};

