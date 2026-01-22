/**
 * Request type for checking a file on CMS host.
 * 
 * CMS 호스트에서 파일 확인을 위한 요청 타입입니다.
 * 
 * @category Requests
 * @since 1.0.0
 */
export type CheckFileRequest = {
    /**
     * Optional file paths to check
     */
    file?: string[];
};

