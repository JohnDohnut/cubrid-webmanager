import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { AppError } from './app-error';
import { ValidationError } from './validation';
import { StandardResponse } from '@type/response/standard-response';

/**
 * Global exception filter for handling all unhandled exceptions across the application.
 * It catches various types of exceptions (HttpException, AppError, and others)
 * and formats the response according to RFC 7807 Problem Details for AppError instances.
 *
 * 애플리케이션 전반의 모든 처리되지 않은 예외를 처리하기 위한 전역 예외 필터입니다.
 * 다양한 유형의 예외(HttpException, AppError 및 기타)를 catch하고
 * AppError 인스턴스의 경우 RFC 7807 문제 세부 정보에 따라 응답 형식을 지정합니다.
 *
 * @category Errors
 * @since 1.0.0
 */
@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest();

        let status: number;
        let note: string;
        let errorData: any = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                note = exceptionResponse;
            } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const responseObj = exceptionResponse as any;
                note = responseObj.message || responseObj.detail || exception.message || 'An error occurred';
                if (responseObj.detail || responseObj.message) {
                    errorData = { message: responseObj.message || responseObj.detail };
                }
            } else {
                note = exception.message || 'An error occurred';
            }

            this.logger.error(
                'HttpException',
                `HTTP Exception: ${exception.message}`,
                exception.stack,
                `${req.method} ${req.url}`,
            );
        } else if (exception instanceof AppError) {
            const problemDetails = exception.toProblemDetails(req.url);

            status = problemDetails.status;
            note = problemDetails.detail || problemDetails.title || exception.message || 'An error occurred';
            
            errorData = {
                code: problemDetails.code,
                type: problemDetails.type,
                title: problemDetails.title,
            };

            const logDetails = exception.toLogDetails(req.url);
            this.logger.error(
                'App Error',
                `App Error [${exception.kind}:${exception.code}]: ${exception.message}`,
                JSON.stringify(logDetails, null, 2),
                `${req.method} ${req.url}`,
            );
        }
        else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            note = exception?.message || 'An unexpected error occurred';

            this.logger.error(
                'Other Errors',
                `Unknown Error: ${exception?.message || 'No message'}`,
                exception?.stack || 'No stack trace',
                `${req.method} ${req.url}`,
            );
        }

        const standardResponse: StandardResponse = {
            data: errorData,
            status: status,
            note: note,
        };

        res.status(status).json(standardResponse);
    }
}
