import { BaseCmsResponse } from '@type/cms-response/base-cms-response';
import { GetEnvCmsResponse } from '@type/cms-response/get-env-cms-response';

/**
 * Client-facing response for environment information.
 * Strips CMS envelope fields from GetEnvCmsResponse.
 *
 * 클라이언트로 반환되는 환경 정보 응답 타입입니다.
 * CMS 메타 필드(BaseCmsResponse)를 제거합니다.
 */
export type GetEnvClientResponse = Omit<GetEnvCmsResponse, keyof BaseCmsResponse>;

