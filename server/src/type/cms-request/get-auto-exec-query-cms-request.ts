import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for getting auto-execution query.
 * 
 * 자동 실행 쿼리를 조회하기 위한 요청 타입입니다.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type GetAutoExecQueryCmsRequest = BaseCmsRequest & {
    /**
     * Task type - must be 'getautoexecquery'
     * 작업 타입 - 'getautoexecquery'로 고정
     */
    task: 'getautoexecquery';

    /**
     * Database name
     * 데이터베이스 이름
     */
    dbname: string;
};

