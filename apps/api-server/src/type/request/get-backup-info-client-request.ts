/**
 * Client request type for getting backup information.
 * 
 * 백업 정보를 조회하기 위한 클라이언트 요청 타입입니다.
 * 
 * @category Client Requests
 * @since 1.0.0
 */
export type GetBackupInfoClientRequest = {
    /**
     * Database name
     * 데이터베이스 이름
     */
    dbname: string;
};

