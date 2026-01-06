import { BaseCmsResponse } from './base-cms-response';

/**
 * Query plan in response.
 * 
 * 응답의 쿼리 계획입니다.
 * 
 * @category CMS Responses
 * @since 1.0.0
 */
export type QueryPlanResponse = {
    /**
     * Query ID
     * 쿼리 ID
     */
    query_id: string;

    /**
     * Username for query execution (with @ prefix in XML, but string in JSON)
     * 쿼리 실행 사용자명 (XML에서는 @ 접두사, JSON에서는 문자열)
     */
    '@username'?: string;
    username?: string;

    /**
     * User password (optional)
     * 사용자 비밀번호 (선택사항)
     */
    userpass?: string;

    /**
     * Period type
     * 주기 타입
     */
    period: string;

    /**
     * Schedule detail
     * 스케줄 상세
     */
    detail: string;

    /**
     * SQL query string
     * SQL 쿼리 문자열
     */
    query_string: string;
};

/**
 * Plan list container in response.
 * 
 * 응답의 계획 목록 컨테이너입니다.
 * 
 * @category CMS Responses
 * @since 1.0.0
 */
export type PlanListResponse = {
    /**
     * Database name
     * 데이터베이스 이름
     */
    dbname: string;

    /**
     * Query plans array
     * 쿼리 계획 배열
     */
    queryplan: QueryPlanResponse[];
};

/**
 * Response type for getautoexecquery request.
 * 
 * getautoexecquery 요청에 대한 응답 타입입니다.
 * 
 * @category CMS Responses
 * @since 1.0.0
 */
export type GetAutoExecQueryCmsResponse = BaseCmsResponse & {
    /**
     * Plan list containing query plans
     * 쿼리 계획을 포함하는 계획 목록
     */
    planlist: PlanListResponse[];
};

