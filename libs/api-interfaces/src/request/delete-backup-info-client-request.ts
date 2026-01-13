/**
 * Client request type for deleting backup information.
 * 
 * 백업 정보를 삭제하기 위한 클라이언트 요청 타입입니다.
 * 
 * @category Client Requests
 * @since 1.0.0
 */
export type DeleteBackupInfoClientRequest = {
    /**
     * Database name
     * 데이터베이스 이름
     */
    dbname: string;

    /**
     * Backup ID to delete
     * 삭제할 백업 ID
     */
    backupid: string;
};
