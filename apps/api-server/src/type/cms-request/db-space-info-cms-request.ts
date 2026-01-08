import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for getting database space information.
 * 
 * 데이터베이스 공간 정보를 조회하기 위한 요청 타입입니다.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type DbSpaceInfoCmsRequest = BaseCmsRequest & {
    dbname: string;
};

