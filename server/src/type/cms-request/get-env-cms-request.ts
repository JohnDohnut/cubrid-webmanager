import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for getting environment information.
 * 
 * 환경 정보 조회를 위한 CMS 요청입니다.
 */
export type GetEnvCmsRequest = BaseCmsRequest & {
    task: 'getenv';
};

