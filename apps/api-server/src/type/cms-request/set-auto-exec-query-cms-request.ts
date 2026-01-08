import { BaseCmsRequest } from './base-cms-request';

/**
 * Query plan for auto-execution.
 * 
 * 자동 실행 쿼리 계획입니다.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type QueryPlan = {
    /**
     * Query ID
     * 쿼리 ID
     */
    query_id: string;

    /**
     * Username for query execution
     * 쿼리 실행 사용자명
     */
    username: string;

    /**
     * User password (optional, can be empty)
     * 사용자 비밀번호 (선택사항, 빈 문자열 가능)
     */
    userpass?: string;

    /**
     * Period type (e.g., 'MONTH', 'WEEK', 'DAY')
     * 주기 타입 (예: 'MONTH', 'WEEK', 'DAY')
     */
    period: string;

    /**
     * Schedule detail (e.g., '1,20 12:30' for day 1 and 20 at 12:30)
     * 스케줄 상세 (예: '1,20 12:30'은 1일과 20일 12:30)
     */
    detail: string;

    /**
     * SQL query string
     * SQL 쿼리 문자열
     */
    query_string: string;
};

/**
 * Plan list container.
 * 
 * 계획 목록 컨테이너입니다.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type PlanList = {
    /**
     * Query plans array
     * 쿼리 계획 배열
     */
    queryplan: QueryPlan[];
};

/**
 * Request type for setting auto-execution query.
 * 
 * 자동 실행 쿼리를 설정하기 위한 요청 타입입니다.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type SetAutoExecQueryCmsRequest = BaseCmsRequest & {
    /**
     * Task type - must be 'setautoexecquery'
     * 작업 타입 - 'setautoexecquery'로 고정
     */
    task: 'setautoexecquery';

    /**
     * Database name
     * 데이터베이스 이름
     */
    dbname: string;

    /**
     * Plan list containing query plans
     * 쿼리 계획을 포함하는 계획 목록
     */
    planlist: PlanList[];
};

