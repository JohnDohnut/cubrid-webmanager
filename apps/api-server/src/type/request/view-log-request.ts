/**
 * Request type for viewing log file content.
 * 로그 파일 내용을 조회하기 위한 요청 타입입니다.
 * 
 * @category Requests
 * @since 1.0.0
 */
export type ViewLogRequest = {
    path: string;
    start: string;
    end: string;
};

