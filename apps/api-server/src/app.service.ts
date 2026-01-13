import { Injectable } from '@nestjs/common';

/**
 * Root application service providing basic application functionality.
 *
 * This service contains basic methods that can be used across the application
 * for simple operations and health checks.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class AppService {
    /**
     * Returns a simple greeting message.
     *
     * This method provides a basic "Hello World!" response that can be used
     * for testing and health check purposes.
     *
     * @returns {string} A simple greeting message
     * @example
     * ```typescript
     * const message = appService.getHello();
     * console.log(message); // "Hello World!"
     * ```
     */
    getHello(): string {
        return 'Hello World!';
    }
}
