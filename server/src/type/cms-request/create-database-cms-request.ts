import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for creating a database.
 * 
 * 데이터베이스를 생성하기 위한 요청 타입입니다.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type CreateDatabaseCmsRequest = BaseCmsRequest & {
    /**
     * Task type - must be 'createdb'
     * 작업 타입 - 'createdb'로 고정
     */
    task: 'createdb';

    /**
     * Database name to create
     * 생성할 데이터베이스 이름
     */
    dbname: string;

    /**
     * Number of pages for the database
     * 데이터베이스의 페이지 수
     */
    numpage: string;

    /**
     * Page size in bytes
     * 페이지 크기 (바이트)
     */
    pagesize: string;

    /**
     * Log size
     * 로그 크기
     */
    logsize: string;

    /**
     * Log page size in bytes
     * 로그 페이지 크기 (바이트)
     */
    logpagesize: string;

    /**
     * General volume path
     * 일반 볼륨 경로
     */
    genvolpath: string;

    /**
     * Log volume path
     * 로그 볼륨 경로
     */
    logvolpath: string;

    /**
     * Extended volumes array
     * 확장 볼륨 배열
     * 
     * Format: Array containing a single object with volume name as key and "type;size;path" as value
     * 형식: 볼륨 이름을 키로, "타입;크기;경로"를 값으로 하는 객체를 포함하는 배열
     * 
     * Example:
     * [
     *   {
     *     "dbname_data_x001": "data;32768;/path/to/dbname",
     *     "dbname_index_x001": "index;32768;/path/to/dbname",
     *     "dbname_temp_x001": "temp;32768;/path/to/dbname"
     *   }
     * ]
     */
    exvol: Array<Record<string, string>>;

    /**
     * Character set for the database
     * 데이터베이스 문자셋
     * 
     * Example: "ko_KR.utf8", "en_US.utf8"
     */
    charset: string;

    /**
     * Whether to overwrite config file
     * 설정 파일 덮어쓰기 여부
     * 
     * Values: "YES" | "NO"
     */
    overwrite_config_file: string;
};

