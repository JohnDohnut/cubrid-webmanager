/**
 * Client response type for deletebackupinfo request.
 * 
 * deletebackupinfo 요청에 대한 클라이언트 응답 타입입니다.
 * 
 * @category Client Responses
 * @since 1.0.0
 */
export type DeleteBackupInfoClientResponse = {
    /**
     * Execution time in milliseconds
     * 실행 시간 (밀리초)
     */
    __EXEC_TIME: string;

    /**
     * Note or additional message
     * 참고 사항 또는 추가 메시지
     */
    note: string;

    /**
     * Response status ('success' | 'error')
     * 응답 상태 ('success' | 'error')
     */
    status: 'success' | 'error';

    /**
     * Task name that was executed
     * 실행된 작업 이름
     */
    task: 'deletebackupinfo';
};
