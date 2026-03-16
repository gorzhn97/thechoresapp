import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorBody = {
    code: string;
    message: string;
    details?: unknown;
    request_id?: string;
    timestamp: string;
    path: string;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const request = context.getRequest<Request & { requestId?: string }>();
        const response = context.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let payload: ErrorBody = {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
            request_id: request.requestId,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                payload = {
                    ...payload,
                    code: this.defaultCode(status),
                    message: exceptionResponse,
                };
            } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const body = exceptionResponse as Record<string, unknown>;
                payload = {
                    ...payload,
                    code: String(body.code ?? this.defaultCode(status)),
                    message: String(body.message ?? 'Request failed'),
                    details: body.details,
                };
            }
        }

        response.status(status).json(payload);
    }

    private defaultCode(status: number): string {
        switch (status) {
            case HttpStatus.BAD_REQUEST:
                return 'BAD_REQUEST';
            case HttpStatus.UNAUTHORIZED:
                return 'UNAUTHORIZED';
            case HttpStatus.FORBIDDEN:
                return 'FORBIDDEN';
            case HttpStatus.NOT_FOUND:
                return 'NOT_FOUND';
            case HttpStatus.CONFLICT:
                return 'CONFLICT';
            default:
                return 'INTERNAL_SERVER_ERROR';
        }
    }
}