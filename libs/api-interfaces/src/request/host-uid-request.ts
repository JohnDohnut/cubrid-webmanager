/**
 * Request type for operations requiring only hostUid.
 * Used for getting or deleting a host.
 * 
 * hostUid만 필요한 작업을 위한 요청 타입입니다.
 * 호스트 조회 또는 삭제에 사용됩니다.
 * 
 * @category Requests
 * @since 1.0.0
 */
export type HostUidRequest = {
    hostUid: string;
};

