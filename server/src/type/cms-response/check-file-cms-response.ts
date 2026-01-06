/**
 * Represents the response structure for a CMS file check request.
 *
 * CMS 파일 확인 요청에 대한 응답 구조를 나타냅니다.
 *
 * @category Responses
 * @since 1.0.0
 */
export type CheckFileCmsResponse = {
    __EXEC_TIME: string;
    note: string;
    status: string;
    task: string;
};
