import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for database statistics dump (statdump).
 *
 * 데이터베이스 통계 덤프(statdump) 요청 타입입니다.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type StatdumpCmsRequest = BaseCmsRequest & {
    /**
     * Host unique identifier
     * 호스트 고유 식별자
     */
    hostUid: string;

    /**
     * Task type - must be 'statdump'
     * 작업 타입 - 'statdump'로 고정
     */
    task: 'statdump';

    /**
     * Database name to retrieve statistics for
     * 통계를 조회할 데이터베이스 이름
     */
    dbname: string;
};


