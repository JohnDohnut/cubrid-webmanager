import { BaseCmsResponse } from '@type/cms-response/base-cms-response';
import { GetAllSysParamCmsResponse } from '@type/cms-response/get-all-sys-param-cms-response';

/**
 * Client-facing response for getting all system parameters.
 * Strips CMS envelope fields from GetAllSysParamCmsResponse.
 *
 * 클라이언트로 반환되는 모든 시스템 파라미터 조회 응답 타입입니다.
 * CMS 메타 필드(BaseCmsResponse)를 제거합니다.
 *
 * @category Responses
 * @since 1.0.0
 */
export type GetAllSysParamClientResponse = Omit<
    GetAllSysParamCmsResponse,
    keyof BaseCmsResponse
>;

