import { BaseCmsResponse } from './base-cms-response';

/**
 * Access log entry in loadaccesslog response.
 * 
 * loadaccesslog 응답의 접근 로그 항목입니다.
 */
export type AccessLogEntry = {
    '@user': string;
    taskname: string;
    time: string;
};

/**
 * Error log entry in loadaccesslog response.
 * 
 * loadaccesslog 응답의 에러 로그 항목입니다.
 */
export type ErrorLogEntry = {
    '@user': string;
    errornote: string;
    taskname: string;
    time: string;
};

/**
 * CMS response for loadaccesslog request.
 * Contains access log and error log entries.
 * 
 * loadaccesslog 요청에 대한 CMS 응답입니다.
 * 접근 로그 및 에러 로그 항목을 포함합니다.
 * 
 * @category CMS Responses
 * @since 1.0.0
 */
export type LoadAccessLogCmsResponse = BaseCmsResponse & {
    accesslog: AccessLogEntry[];
    errorlog: ErrorLogEntry[];
};

