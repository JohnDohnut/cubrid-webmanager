/**
 * Represents the response structure for a CMS login request.
 * It typically contains the authentication token upon successful login.
 *
 * CMS 로그인 요청에 대한 응답 구조를 나타냅니다.
 * 일반적으로 성공적인 로그인 시 인증 토큰을 포함합니다.
 *
 * @category Responses
 * @since 1.0.0
 */
export type LoginCmsResponse = {
    token: string;
};
