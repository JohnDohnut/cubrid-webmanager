import { SetMetadata } from '@nestjs/common';

/**
 * A decorator that marks a controller method or class as publicly accessible.
 *
 * When applied, the method/class will bypass JWT authentication requirements.
 * This decorator is used to mark endpoints that should be accessible without
 * authentication, such as login, registration, or public API endpoints.
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
 *   }
 * }
 * ```
 */
export const Public = () => SetMetadata('isPublic', true);
