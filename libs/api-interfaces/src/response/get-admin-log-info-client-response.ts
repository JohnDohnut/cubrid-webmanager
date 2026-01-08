import { AdminLogInfoEntry } from '@type/cms-response/get-admin-log-info-cms-response';

/**
 * Client-facing response for admin log information.
 * Strips CMS envelope fields from GetAdminLogInfoCmsResponse.
 *
 * 클라이언트로 반환되는 관리자 로그 정보 응답 타입입니다.
 * CMS 메타 필드(BaseCmsResponse)를 제거합니다.
 *
 * @category Responses
 * @since 1.0.0
 */
export type GetAdminLogInfoClientResponse = {
    /**
     * Array of admin log information entries
     * 관리자 로그 정보 항목 배열
     */
    adminloginfo: AdminLogInfoEntry[];
};

