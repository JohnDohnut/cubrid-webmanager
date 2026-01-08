import { BaseCmsResponse } from './base-cms-response';

/**
 * Admin log info entry in getadminloginfo response.
 * 
 * getadminloginfo 응답의 관리자 로그 정보 항목입니다.
 */
export type AdminLogInfoEntry = {
    /**
     * Last update date of the log file
     * 로그 파일의 마지막 업데이트 날짜
     */
    lastupdate: string;

    /**
     * Owner of the log file
     * 로그 파일의 소유자
     */
    owner: string;

    /**
     * Full path to the log file
     * 로그 파일의 전체 경로
     */
    path: string;

    /**
     * Size of the log file in bytes (as string)
     * 로그 파일의 크기 (바이트, 문자열 형식)
     */
    size: string;
};

/**
 * CMS response for getadminloginfo request.
 * Contains admin log information.
 * 
 * getadminloginfo 요청에 대한 CMS 응답입니다.
 * 관리자 로그 정보를 포함합니다.
 * 
 * @category CMS Responses
 * @since 1.0.0
 */
export type GetAdminLogInfoCmsResponse = BaseCmsResponse & {
    /**
     * Array of admin log information entries
     * 관리자 로그 정보 항목 배열
     */
    adminloginfo: AdminLogInfoEntry[];
};

