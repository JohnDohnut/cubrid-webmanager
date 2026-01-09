import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for getting database space information.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type DbSpaceInfoCmsRequest = BaseCmsRequest & {
    dbname: string;
};

