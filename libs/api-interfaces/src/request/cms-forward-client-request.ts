/**
 * Universal client request type for CMS forwarding operations.
 * Contains hostUid and task, but excludes token (server adds token).
 * 
 * CMS 전달 작업을 위한 범용 클라이언트 요청 타입입니다.
 * hostUid와 task를 포함하지만 token은 제외됩니다 (서버가 토큰을 추가합니다).
 * 
 * @category Requests
 * @since 1.0.0
 */
export type CmsForwardClientRequest = {
    hostUid: string;
    task: string;
};

