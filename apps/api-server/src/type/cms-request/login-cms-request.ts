import { BaseCmsRequest } from './base-cms-request';

/**
 * Represents a CMS login request. It extends BaseCmsRequest but omits the token,
 * as the token is typically obtained after a successful login.
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
