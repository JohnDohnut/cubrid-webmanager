import { LogContentContainer } from '@type/cms-response/view-log-cms-response';

/**
 * Client-facing response for log file content.
 * Strips CMS envelope fields from ViewLogCmsResponse.
 *
 * 클라이언트로 반환되는 로그 파일 내용 응답 타입입니다.
 * CMS 메타 필드(BaseCmsResponse)를 제거합니다.
 *
 * @category Responses
 * @since 1.0.0
 */
export type ViewLogClientResponse = {
    end: string;
    log: LogContentContainer[];
    path: string;
    start: string;
    total: string;
};

