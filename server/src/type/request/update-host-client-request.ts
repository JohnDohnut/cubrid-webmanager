import { HostInfo } from '@type/host-info';

/**
 * Request type for updating a host.
 * Contains host information with hostUid instead of uid for client requests.
 * 
 * 호스트 업데이트를 위한 요청 타입입니다.
 * 클라이언트 요청을 위해 uid 대신 hostUid를 사용합니다.
 * 
 * @category Requests
 * @since 1.0.0
 */
export type UpdateHostClientRequest = Omit<HostInfo, 'uid' | 'token'> & {
    hostUid: string;
};
