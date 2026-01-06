import { BaseDatabaseRequest as BaseDatabaseRequest } from "./base-database-request";

/**
 * Request type for database login operations.
 * Used for client-to-server communication.
 * 
 * 데이터베이스 로그인 작업을 위한 요청 타입입니다.
 * 클라이언트-서버 간 통신에 사용됩니다.
 * 
 * Profile이 있는 경우: dbname만 필요
 * Profile이 없는 경우: dbname + id + password 필요
 * 
 * @category Requests
 * @since 1.0.0
 */
export type DatabaseLoginClientRequest = BaseDatabaseRequest & {
    // Profile이 없는 경우에만 필요
    id?: string;
    password?: string;
};

