import { BaseCmsResponse } from '@type/cms-response/base-cms-response';
import { ParamdumpCmsResponse } from '@type/cms-response/paramdump-cms-response';

/**
 * Client-facing response for paramdump.
 * Strips CMS envelope fields from ParamdumpCmsResponse.
 *
 * 클라이언트로 반환되는 paramdump 응답 타입입니다.
 * CMS 메타 필드(BaseCmsResponse)를 제거합니다.
 *
 * @category Responses
 * @since 1.0.0
 */
export type ParamdumpClientResponse = Omit<
    ParamdumpCmsResponse,
    keyof BaseCmsResponse
>;

