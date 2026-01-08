import { BaseCmsRequest } from './base-cms-request';

/**
 * @deprecated Use CmsForwardClientRequest instead.
 * This type is kept for backward compatibility but will be removed in future versions.
 * 
 * @deprecated CmsForwardClientRequest를 사용하세요.
 * 이 타입은 하위 호환성을 위해 유지되지만 향후 버전에서 제거될 예정입니다.
 */
export type CmsForwardRequestWithoutToken = Omit<BaseCmsRequest, 'token'> & {
    hostUid: string;
};

