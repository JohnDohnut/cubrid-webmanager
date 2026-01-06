import { BaseCmsResponse } from './base-cms-response';

/**
 * Log content container in viewlog response.
 * 
 * viewlog 응답의 로그 내용 컨테이너입니다.
 */
export type LogContentContainer = {
    line: string[];
};

/**
 * CMS response for viewlog request.
 * Contains log file content lines.
 * 
 * viewlog 요청에 대한 CMS 응답입니다.
 * 로그 파일 내용 라인을 포함합니다.
 * 
 * @category CMS Responses
 * @since 1.0.0
 */
export type ViewLogCmsResponse = BaseCmsResponse & {
    end: string;
    log: LogContentContainer[];
    path: string;
    start: string;
    total: string;
};

