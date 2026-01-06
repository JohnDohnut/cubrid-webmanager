import { UserError, UserErrorCode } from '@error';
import { AuthError } from '@error/auth/auth-error';

/**
 * A method decorator that wraps authentication methods in a try...catch block.
 * 인증 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * 에러를 변환하지 않고 그대로 전달합니다. 시스템/라이브러리 레벨 에러는
 * 하위 데코레이터에서 이미 AppError로 변환되었으므로 그대로 전달합니다.
 *
 * Errors are passed through as-is. System/library level errors are already
 * converted to AppError by lower-level decorators.
 *
 * @category Decorators
 * @since 1.0.0
 */
export function HandleAuthErrors() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            try {
                return await originalMethod.apply(this, args);
            } catch (err) {
                // 모든 에러를 그대로 전달 (변환하지 않음)
                throw err;
            }
        };
    };
}
