/**
 * Interface representing database connection information.
 * 데이터베이스 연결 정보를 나타내는 인터페이스입니다.
 *
 * Contains database connection details including host, port,
 * database name, and authentication credentials.
 *
 * 호스트, 포트, 데이터베이스 이름, 인증 자격 증명을 포함한
 * 데이터베이스 연결 세부정보를 포함합니다.
 *
 * @category Types
 * @since 1.0.0
 */
export interface DBInfo {
    dbname:string;
    id: string;
    password: string;
}
