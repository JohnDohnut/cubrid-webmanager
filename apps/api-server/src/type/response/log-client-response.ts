/**
 * Response types for log operations.
 * 로그 작업을 위한 응답 타입입니다.
 * 
 * @category Responses
 * @since 1.0.0
 */

/**
 * Broker log list response.
 * 브로커 로그 목록 응답입니다.
 */
export type BrokerLogListResponse = {
    broker: string;
    logfileinfo: Array<{
        logfile: Array<{
            lastupdate: string;
            owner: string;
            path: string;
            size: string;
            type: string;
        }>;
    }>;
};

/**
 * Database log list response.
 * 데이터베이스 로그 목록 응답입니다.
 */
export type DatabaseLogListResponse = {
    dbname: string;
    loginfo: Array<{
        log: Array<{
            '@owner'?: string;
            lastupdate: string;
            path: string;
            size: string;
        }>;
    }>;
};

/**
 * CMS log list response.
 * CMS 로그 목록 응답입니다.
 */
export type CmsLogListResponse = {
    accesslog: Array<{
        '@user': string;
        taskname: string;
        time: string;
    }>;
    errorlog: Array<{
        '@user': string;
        errornote: string;
        taskname: string;
        time: string;
    }>;
};

/**
 * View log file response.
 * 로그 파일 내용 조회 응답입니다.
 */
export type ViewLogResponse = {
    path: string;
    start: string;
    end: string;
    total: string;
    log: Array<{
        line: string[];
    }>;
};

