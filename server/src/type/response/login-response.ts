/**
 * Response type for login operations.
 * 로그인 작업을 위한 응답 타입입니다.
 *
 * Contains the JWT token returned after successful authentication.
 *
 * 성공적인 인증 후 반환되는 JWT 토큰을 포함합니다.
 *
 * @category Responses
 * @since 1.0.0
 */
export type LoginResponse = {
    token: string;
};

/**
 * Factory function to create a login response.
 * 로그인 응답을 생성하는 팩토리 함수입니다.
 *
 * @param token - The JWT token to include in the response / 응답에 포함할 JWT 토큰
 * @returns LoginResponse object containing the token / 토큰을 포함하는 LoginResponse 객체
 * @category Responses
 * @since 1.0.0
 */
export function CreateLoginResponse(token: string) {
    const response: LoginResponse = {
        token: token,
    };
    return response;
}
