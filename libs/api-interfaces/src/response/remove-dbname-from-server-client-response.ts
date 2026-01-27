import { SetSysParamClientResponse } from './set-sys-param-client-response';

/**
 * Client response for removing a database name from the server parameter.
 * Returns empty object on success (CMS envelope fields removed).
 *
 * @category Responses
 * @since 1.0.0
 */
export type RemoveDbnameFromServerClientResponse = SetSysParamClientResponse;
