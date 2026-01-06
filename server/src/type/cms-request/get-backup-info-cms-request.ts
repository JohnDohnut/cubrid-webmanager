import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for getting backup information.
 * 
 * 백업 정보를 조회하기 위한 요청 타입입니다.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type GetBackupInfoCmsRequest = BaseCmsRequest & {
    /**
     * Task type - must be 'getbackupinfo'
     * 작업 타입 - 'getbackupinfo'로 고정
     */
    task: 'getbackupinfo';

    /**
     * Database name
     * 데이터베이스 이름
     */
    dbname: string;
};

