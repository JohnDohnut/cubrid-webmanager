import { BaseCmsResponse } from '@type/cms-response/base-cms-response';
import { GetBrokerStatusCmsResponse } from '@type/cms-response/get-broker-status-cms-response';

/**
 * Client-facing response for broker status.
 * Strips CMS envelope fields from GetBrokerStatusCmsResponse.
 *
 * 클라이언트로 반환되는 브로커 상태 응답 타입입니다.
 * CMS 메타 필드(BaseCmsResponse)를 제거합니다.
 */
export type GetBrokerStatusClientResponse = Omit<GetBrokerStatusCmsResponse, keyof BaseCmsResponse>;

