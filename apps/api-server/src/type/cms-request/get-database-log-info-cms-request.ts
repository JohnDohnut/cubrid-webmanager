import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for getting database log file information.
 * 
 * 데이터베이스 로그 파일 정보 조회를 위한 CMS 요청입니다.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type GetDatabaseLogInfoCmsRequest = BaseCmsRequest & {
    task: 'getloginfo';
    dbname: string;
};

