import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for dumping database parameters.
 * 
 * 데이터베이스 파라미터 덤프를 위한 요청 타입입니다.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type ParamdumpCmsRequest = BaseCmsRequest & {
    /**
     * Host unique identifier
     * 호스트 고유 식별자
     */
    hostUid: string;

    /**
     * Task type - must be 'paramdump'
     * 작업 타입 - 'paramdump'로 고정
     */
    task: 'paramdump';

    /**
     * Database name to dump parameters for
     * 파라미터를 덤프할 데이터베이스 이름
     */
    dbname: string;

    /**
     * Whether to include both server and broker parameters
     * 서버 및 브로커 파라미터 모두 포함 여부
     * 
     * Values: 'y' (yes) | 'n' (no)
     */
    both: 'n' | 'y';
};

