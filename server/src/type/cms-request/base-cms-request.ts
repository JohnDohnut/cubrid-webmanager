/**
 * Represents the base structure for a CMS request, including a task and an authentication token.
 *
 * 작업 및 인증 토큰을 포함하는 CMS 요청의 기본 구조를 나타냅니다.
 *
 * @category Requests
 * @since 1.0.0
 */
export type BaseCmsRequest = {
    task: string;
    token: string;
};
