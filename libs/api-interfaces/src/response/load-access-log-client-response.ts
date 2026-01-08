import { AccessLogEntry, ErrorLogEntry } from '@type/cms-response/load-access-log-cms-response';

/**
 * Client-facing response for access log.
 * Strips CMS envelope fields from LoadAccessLogCmsResponse.
 *
 * 클라이언트로 반환되는 접근 로그 응답 타입입니다.
 * CMS 메타 필드(BaseCmsResponse)를 제거합니다.
 *
 * @category Responses
 * @since 1.0.0
 */
export type LoadAccessLogClientResponse = {
    accesslog: AccessLogEntry[];
    errorlog: ErrorLogEntry[];
};

