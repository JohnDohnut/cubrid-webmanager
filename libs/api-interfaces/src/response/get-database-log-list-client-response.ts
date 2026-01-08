import { DatabaseLogInfoContainer } from '@type/cms-response/get-database-log-info-cms-response';

/**
 * Client-facing response for database log file list.
 * Strips CMS envelope fields from GetDatabaseLogInfoCmsResponse.
 *
 * 클라이언트로 반환되는 데이터베이스 로그 파일 목록 응답 타입입니다.
 * CMS 메타 필드(BaseCmsResponse)를 제거합니다.
 *
 * @category Responses
 * @since 1.0.0
 */
export type GetDatabaseLogListClientResponse = {
    dbname: string;
    loginfo: DatabaseLogInfoContainer[];
};

