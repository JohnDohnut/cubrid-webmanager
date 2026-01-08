/**
 * Request type for database operations.
 * Used for client-to-server communication.
 * 
 * 데이터베이스 작업을 위한 요청 타입입니다.
 * 클라이언트-서버 간 통신에 사용됩니다.
 * 
 * @category Requests
 * @since 1.0.0
 */
export type BaseDatabaseRequest = {
    hostUid: string;
    dbname: string;
};

