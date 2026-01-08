import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for loading access log.
 * 
 * 접근 로그 조회를 위한 CMS 요청입니다.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type LoadAccessLogCmsRequest = BaseCmsRequest & {
    task: 'loadaccesslog';
};

