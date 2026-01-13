/**
 * Client-facing response for setting system parameters.
 * Returns empty object on success (CMS envelope fields removed).
 *
 * 클라이언트로 반환되는 시스템 파라미터 설정 응답 타입입니다.
 * 성공 시 빈 객체를 반환합니다 (CMS 메타 필드 제거).
 *
 * @category Responses
 * @since 1.0.0
 */
export type SetSysParamClientResponse = Record<string, never>;

