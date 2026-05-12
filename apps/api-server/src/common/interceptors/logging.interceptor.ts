import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { buildLogLine, formatLogPayload, sanitizeHeadersForLog } from '@util';

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
    const requestContext = this.buildRequestContext(request);

    this.logger.log(
      buildLogLine({
        event: 'http_request',
        phase: 'start',
        ...requestContext,
      })
    );

    if (request.body && Object.keys(request.body).length > 0) {
      this.logger.debug(
        buildLogLine({
          event: 'http_request_body',
          ...requestContext,
          body: formatLogPayload(request.body),
        })
      );
    }

    if (request.headers && Object.keys(request.headers).length > 0) {
      this.logger.debug(
        buildLogLine({
          event: 'http_request_headers',
          ...requestContext,
          headers: formatLogPayload(sanitizeHeadersForLog(request.headers)),
        })
      );
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logger.log(
            buildLogLine({
              event: 'http_response',
              ...requestContext,
              statusCode: response.statusCode,
              durationMs: Date.now() - now,
              payload: formatLogPayload(data, 500),
            })
          );
        },
        error: (error) => {
          this.logger.error(
            buildLogLine({
              event: 'http_error',
              ...requestContext,
              statusCode: error.status || 'N/A',
              durationMs: Date.now() - now,
              message: error.message,
            }),
            error.stack
          );
        },
      })
    );
  }

  private buildRequestContext(request: any): Record<string, unknown> {
    return {
      method: request.method,
      path: request.url,
      ip: request.ip,
      userId: request.user?.sub,
      hostUid: request.params?.hostUid,
    };
  }
}
