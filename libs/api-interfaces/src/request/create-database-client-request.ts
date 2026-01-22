/**
 * Extended volume information.
 * 
 * @category Client Requests
 * @since 1.0.0
 */


export type ExvolInfo = {
    /**
     * Volume type (e.g., 'data', 'index', 'temp', 'generic')
     * 볼륨 타입 (예: 'data', 'index', 'temp', 'generic')
     */
    type: 'data' | 'index' | 'temp' | 'generic';

    /**
     * Volume size in MB
     * 볼륨 크기 (MB)
     */
    size: number;

    /**
     * Page size in bytes
     * 페이지 크기 (바이트)
     */
    pagesize: number;

    /**
     * Volume path
     * 볼륨 경로
     */
    volpath: string;
};

/**
 * Client request type for creating a database.
 * 
 * 데이터베이스를 생성하기 위한 클라이언트 요청 타입입니다.
 * 
 * @category Client Requests
 * @since 1.0.0
 */
export type CreateDatabaseClientRequest = {
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
     * Format: Array containing objects with volume name as key and ExvolInfo as value
     * 형식: 볼륨 이름을 키로, ExvolInfo 객체를 값으로 하는 객체를 포함하는 배열
     * 
     * Example:
     * [
     *   {
     *     "dbname_data_x001": {
     *       type: "data",
     *       size: 512,  // MB
     *       pagesize: 16384,  // bytes
     *       volpath: "/path/to/dbname"
     *     },
     *     "dbname_index_x001": {
     *       type: "index",
     *       size: 512,  // MB
     *       pagesize: 16384,  // bytes
     *       volpath: "/path/to/dbname"
     *     }
     *   }
     * ]
     */
    exvol?: Array<Record<string, ExvolInfo>>;

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
    overwrite_config_file: "YES" | "NO";
};

