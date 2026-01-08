import { SetMetadata } from '@nestjs/common';

/**
 * A decorator that marks a controller method or class as publicly accessible.
 * 컨트롤러 메서드나 클래스를 공개적으로 접근 가능하도록 표시하는 데코레이터입니다.
 *
 * When applied, the method/class will bypass JWT authentication requirements.
 * This decorator is used to mark endpoints that should be accessible without
 * authentication, such as login, registration, or public API endpoints.
 *
 * 적용되면 메서드/클래스가 JWT 인증 요구사항을 우회합니다.
 * 이 데코레이터는 로그인, 등록 또는 공개 API 엔드포인트와 같이
 * 인증 없이 접근 가능해야 하는 엔드포인트를 표시하는 데 사용됩니다.
 *
 * @category Decorators
 * @since 1.0.0
 * @example
 * ```typescript
 * @Controller('auth')
 * export class AuthController {
 *   @Public()
 *   @Post('login')
 *   async login(@Body() credentials: LoginDto) {
 *     // This endpoint is publicly accessible
 *     // 이 엔드포인트는 공개적으로 접근 가능합니다
 *   }
 * }
 * ```
 */
export const Public = () => SetMetadata('isPublic', true);
