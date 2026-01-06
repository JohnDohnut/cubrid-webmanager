import { CmsError } from '@error/cms/cms-error';
import { AppError } from '@error/app-error';
import { Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

/**
 * A method decorator that wraps CMS client methods in a try...catch block.
 * CMS 클라이언트 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * It provides centralized handling for HTTP/Axios errors when communicating
 * with CMS services, translating them into appropriate CmsError instances.
 *
 * CMS 서비스와 통신할 때 HTTP/Axios 오류에 대한 중앙 집중식 처리를 제공하여
 * 적절한 CmsError 인스턴스로 변환합니다.
 *
 * This decorator handles various HTTP error scenarios:
 * - Response errors (4xx, 5xx status codes)
 * - Request errors (network issues, timeouts)
 * - Unknown errors
 *
 * 이 데코레이터는 다양한 HTTP 오류 시나리오를 처리합니다:
 * - 응답 오류 (4xx, 5xx 상태 코드)
 * - 요청 오류 (네트워크 문제, 타임아웃)
 * - 알 수 없는 오류
 *
 * @category Decorators
 * @since 1.0.0
 * @example
 * ```typescript
 * class CmsHttpsClientService {
 *   @HandleCmsHttpsClientErrors()
 *   async postData(url: string, data: any): Promise<any> {
 *     return this.httpService.post(url, data);
 *   }
 * }
 * ```
 */
export function HandleCmsHttpsClientErrors() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            try {
                return await originalMethod.apply(this, args);
            } catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }

                // Check if error has axios-like structure
                if (error?.response || error?.request || error?.config) {
                    const axiosError = error as AxiosError;
                    if (axiosError.response) {
                        throw CmsError.RequestFailed(
                            {
                                status: axiosError.response.status,
                                data: axiosError.response.data,
                            },
                            error,
                        );
                    } else if (axiosError.request) {
                        Logger.log(axiosError.request);
                        throw CmsError.NoResponse(undefined, error);
                    }
                }
                throw CmsError.Unknown(
                    { message: error.message || 'Unknown error' },
                    error,
                );
            }
        };

        return descriptor;
    };
}
