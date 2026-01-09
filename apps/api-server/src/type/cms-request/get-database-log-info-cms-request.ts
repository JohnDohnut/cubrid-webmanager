import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for getting database log file information.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type GetDatabaseLogInfoCmsRequest = BaseCmsRequest & {
    task: 'getloginfo';
    dbname: string;
};

