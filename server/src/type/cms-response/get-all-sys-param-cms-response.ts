import { BaseCmsResponse } from './base-cms-response';

/**
 * Response type for getting all system parameters.
 * 
 * 모든 시스템 파라미터 조회 응답 타입입니다.
 * 
 * @category CMS Responses
 * @since 1.0.0
 */
export type GetAllSysParamCmsResponse = BaseCmsResponse & {
    /**
     * Configuration file name
     * 설정 파일 이름
     */
    confname: string;

    /**
     * Configuration list containing configuration data
     * 설정 데이터를 포함하는 설정 목록
     */
    conflist: Array<{
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
    }>;
};

/**
 * Parsed system parameter structure
 * 파싱된 시스템 파라미터 구조
 */
export type ParsedSystemParameter = {
    /**
     * Parameter key
     * 파라미터 키
     */
    key: string;

    /**
     * Parameter value
     * 파라미터 값
     */
    value: string;

    /**
     * Section name (e.g., "common", "service", "monitoring")
     * 섹션 이름 (예: "common", "service", "monitoring")
     */
    section: string;

    /**
     * Original line number in confdata array
     * confdata 배열의 원본 라인 번호
     */
    lineNumber: number;
};

/**
 * System parameters grouped by section
 * 섹션별로 그룹화된 시스템 파라미터
 */
export type SystemParametersBySection = {
    /**
     * Section name
     * 섹션 이름
     */
    [section: string]: {
        /**
         * Parameters in this section
         * 이 섹션의 파라미터들
         */
        [key: string]: string;
    };
};

