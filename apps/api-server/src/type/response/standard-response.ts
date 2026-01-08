/**
 * Standard response format for all API responses.
 * 
 * 모든 API 응답에 대한 표준 응답 형식입니다.
 * 
 * @template T - The type of data being returned
 * 
 * @category Responses
 * @since 1.0.0
 */
export type StandardResponse<T = any> = {
    data: T;
    status: number;
    note: string;
};

