/**
 * Client response type for get-createdb-info request.
 * Provides default values and information needed for creating a database.
 * 
 * get-createdb-info 요청에 대한 클라이언트 응답 타입입니다.
 * 데이터베이스 생성에 필요한 기본값과 정보를 제공합니다.
 * 
 * @category Client Responses
 * @since 1.0.0
 */
export type GetCreatedbInfoClientResponse = {
    /**
     * Default database directory path (from CUBRID_DATABASES environment variable)
     * 기본 데이터베이스 디렉토리 경로 (CUBRID_DATABASES 환경 변수)
     */
    defaultDbDirectory: string;

    /**
     * CUBRID version
     * CUBRID 버전
     */
    cubridVersion?: string;

    /**
     * CUBRID installation path
     * CUBRID 설치 경로
     */
    cubridPath?: string;
};
