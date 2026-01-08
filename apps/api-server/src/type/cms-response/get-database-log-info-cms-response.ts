import { BaseCmsResponse } from './base-cms-response';

/**
 * Database log file information in getloginfo response.
 * 
 * getloginfo 응답의 데이터베이스 로그 파일 정보입니다.
 */
export type DatabaseLogFileInfo = {
    '@owner': string;
    lastupdate: string;
    path: string;
    size: string;
};

/**
 * Database log info container in getloginfo response.
 * 
 * getloginfo 응답의 데이터베이스 로그 정보 컨테이너입니다.
 */
export type DatabaseLogInfoContainer = {
    log: DatabaseLogFileInfo[];
};

/**
 * CMS response for getloginfo request (database log).
 * Contains database log file information.
 * 
 * getloginfo 요청에 대한 CMS 응답입니다 (데이터베이스 로그).
 * 데이터베이스 로그 파일 정보를 포함합니다.
 * 
 * @category CMS Responses
 * @since 1.0.0
 */
export type GetDatabaseLogInfoCmsResponse = BaseCmsResponse & {
    dbname: string;
    loginfo: DatabaseLogInfoContainer[];
};

