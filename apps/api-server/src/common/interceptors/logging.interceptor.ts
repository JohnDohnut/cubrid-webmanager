import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor for logging incoming requests and outgoing responses.
 *
 * This interceptor logs details about the HTTP request before it's handled by the controller
 * and logs details about the response (or error) after the controller has processed it.
 *
 * @category Interceptors
 * @since 1.0.0
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const now = Date.now();

    this.logger.log(
      `Incoming Request: ${request.method} ${request.url}`,
      `IP: ${request.ip}`,
      `Headers: ${JSON.stringify(request.headers)}`,
      `Body: ${JSON.stringify(request.body)}`
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logger.log(
            `Outgoing Response: ${request.method} ${request.url} - ${response.statusCode}`,
            `Duration: ${Date.now() - now}ms`,
            `Response Body (partial): ${JSON.stringify(data).substring(0, 200)}...`
          );
        },
        error: (error) => {
          this.logger.error(
            `Error Response: ${request.method} ${request.url} - ${error.status || 'N/A'}`,
            `Duration: ${Date.now() - now}ms`,
            `Error Message: ${error.message}`,
            error.stack
          );
        },
      })
    );
  }
}
