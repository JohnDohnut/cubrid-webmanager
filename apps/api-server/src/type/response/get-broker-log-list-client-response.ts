import { LogFileInfoContainer } from '@type/cms-response/get-log-file-info-cms-response';

/**
 * Client-facing response for broker log file list.
 * Strips CMS envelope fields from GetLogFileInfoCmsResponse.
 *
 * 클라이언트로 반환되는 브로커 로그 파일 목록 응답 타입입니다.
 * CMS 메타 필드(BaseCmsResponse)를 제거합니다.
 *
 * @category Responses
 * @since 1.0.0
 */
export type GetBrokerLogListClientResponse = {
    broker: string;
    logfileinfo: LogFileInfoContainer[];
};

