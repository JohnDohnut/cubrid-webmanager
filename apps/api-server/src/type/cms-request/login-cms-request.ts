import { BaseCmsRequest } from './base-cms-request';

/**
 * Represents a CMS login request. It extends BaseCmsRequest but omits the token,
 * as the token is typically obtained after a successful login.
 *
 * CMS 로그인 요청을 나타냅니다. BaseCmsRequest를 확장하지만 토큰은 생략합니다.
 * 토큰은 일반적으로 성공적인 로그인 후에 얻어지기 때문입니다.
 *
 * @category Requests
 * @since 1.0.0
 */
export type LoginCmsRequest = Omit<BaseCmsRequest, 'token'> & {
    host?: string;
    port?: string;
    id: string;
    password: string;
    clientver?: string;
};
