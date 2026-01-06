/**
 * Client request for viewing log file content.
 * 
 * 로그 파일 내용 조회를 위한 클라이언트 요청입니다.
 * 
 * @category Requests
 * @since 1.0.0
 */
export type ViewLogClientRequest = {
    path: string;
    start: string;
    end: string;
};

