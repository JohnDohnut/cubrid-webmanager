/**
 * Response type for login and token refresh operations.
 *
 * @category Responses
 * @since 1.0.0
 */
export type LoginResponse = {
  /** Access JWT (Bearer). */
  token: string;
  /** Opaque refresh token (rotate on each refresh). */
  refreshToken: string;
  /** Access token lifetime in seconds. */
  expiresIn: number;
};

export type AuthTokens = LoginResponse;

/**
 * Factory function to create a login/refresh response.
 */
export function CreateLoginResponse(
  token: string,
  refreshToken: string,
  expiresIn: number
): LoginResponse {
  return { token, refreshToken, expiresIn };
}
