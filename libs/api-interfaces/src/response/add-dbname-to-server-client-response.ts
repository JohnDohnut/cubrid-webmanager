import { SetSysParamClientResponse } from './set-sys-param-client-response';

/**
 * Client response for adding a database name to the server parameter.
 * Returns empty object on success (CMS envelope fields removed).
 *
 * @category Responses
 * @since 1.0.0
 */
export type AddDbnameToServerClientResponse = SetSysParamClientResponse;
