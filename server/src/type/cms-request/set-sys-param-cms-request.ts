import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for setting system parameters in a configuration file.
 * 
 * 설정 파일에 시스템 파라미터를 설정하기 위한 요청 타입입니다.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type SetSysParamCmsRequest = BaseCmsRequest & {
    /**
     * Configuration file name
     * 설정 파일 이름
     * 
     * Example: "cubridconf", "broker.conf"
     */
    confname: string;

    /**
     * Configuration data as array of lines
     * 라인별 설정 데이터 배열
     * 
     * Contains raw configuration file content including:
     * - Comments (lines starting with #)
     * - Section headers (lines like [section])
     * - Parameter lines (key=value format)
     * - Empty lines
     * 
     * 포함 내용:
     * - 주석 (#로 시작하는 라인)
     * - 섹션 헤더 ([section] 형식)
     * - 파라미터 라인 (key=value 형식)
     * - 빈 라인
     */
    confdata: string[];
};

