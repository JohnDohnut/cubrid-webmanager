import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for setting auto-add volume configuration for a database.
 * 
 * 데이터베이스의 자동 볼륨 추가 설정을 변경하기 위한 요청 타입입니다.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type SetAutoAddVolCmsRequest = BaseCmsRequest & {
    /**
     * Database name
     * 데이터베이스 이름
     */
    dbname: string;

    /**
     * Auto-add data volume setting
     * 데이터 볼륨 자동 추가 설정
     * 
     * Values: "ON" | "OFF"
     */
    data: string;

    /**
     * Data volume warning threshold for out of space
     * 데이터 볼륨 공간 부족 경고 임계값
     * 
     * Format: Decimal string (e.g., "0.15" means 15%)
     * 형식: 소수점 문자열 (예: "0.15"는 15%를 의미)
     */
    data_warn_outofspace: string;

    /**
     * Data volume extension page size
     * 데이터 볼륨 확장 페이지 크기
     * 
     * Format: Number string (e.g., "32768")
     * 형식: 숫자 문자열 (예: "32768")
     */
    data_ext_page: string;

    /**
     * Auto-add index volume setting
     * 인덱스 볼륨 자동 추가 설정
     * 
     * Values: "ON" | "OFF"
     */
    index: string;

    /**
     * Index volume warning threshold for out of space
     * 인덱스 볼륨 공간 부족 경고 임계값
     * 
     * Format: Decimal string (e.g., "0.15" means 15%)
     * 형식: 소수점 문자열 (예: "0.15"는 15%를 의미)
     */
    index_warn_outofspace: string;

    /**
     * Index volume extension page size
     * 인덱스 볼륨 확장 페이지 크기
     * 
     * Format: Number string (e.g., "32768")
     * 형식: 숫자 문자열 (예: "32768")
     */
    index_ext_page: string;
};

