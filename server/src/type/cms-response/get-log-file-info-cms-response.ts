import { BaseCmsResponse } from './base-cms-response';

/**
 * Log file information in getlogfileinfo response.
 * 
 * getlogfileinfo 응답의 로그 파일 정보입니다.
 */
export type LogFileInfo = {
    lastupdate: string;
    owner: string;
    path: string;
    size: string;
    type: string;
};

/**
 * Log file info container in getlogfileinfo response.
 * 
 * getlogfileinfo 응답의 로그 파일 정보 컨테이너입니다.
 */
export type LogFileInfoContainer = {
    logfile: LogFileInfo[];
};

/**
 * CMS response for getlogfileinfo request.
 * Contains broker log file information.
 * 
 * getlogfileinfo 요청에 대한 CMS 응답입니다.
 * 브로커 로그 파일 정보를 포함합니다.
 * 
 * @category CMS Responses
 * @since 1.0.0
 */
export type GetLogFileInfoCmsResponse = BaseCmsResponse & {
    broker: string;
    from: string;
    logfileinfo: LogFileInfoContainer[];
};

