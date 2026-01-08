import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for getting admin log information.
 * 
 * 관리자 로그 정보를 조회하기 위한 요청 타입입니다.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type GetAdminLogInfoCmsRequest = BaseCmsRequest & {
    /**
     * Task type - must be 'getadminloginfo'
     * 작업 타입 - 'getadminloginfo'로 고정
     */
    task: 'getadminloginfo';
};

