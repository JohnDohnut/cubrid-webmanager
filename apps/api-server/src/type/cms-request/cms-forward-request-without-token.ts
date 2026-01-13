import { BaseCmsRequest } from './base-cms-request';

/**
 * @deprecated Use CmsForwardClientRequest instead.
 * This type is kept for backward compatibility but will be removed in future versions.
 */
export type CmsForwardRequestWithoutToken = Omit<BaseCmsRequest, 'token'> & {
    hostUid: string;
};

