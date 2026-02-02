import { SetSysParamClientResponse } from './set-sys-param-client-response';

/**
 * Client response for disabling auto-start for a database.
 * Returns empty object on success (CMS envelope fields removed).
 *
 * @category Responses
 * @since 1.0.0
 */
export type RemoveAutoStartResponse = SetSysParamClientResponse;
