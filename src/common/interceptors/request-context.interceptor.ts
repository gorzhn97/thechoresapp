import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
    private readonly logger = new Logger(RequestContextInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest<Request & { requestId?: string }>();
        const response = httpContext.getResponse<Response>();
        const requestId = request.headers['x-request-id']?.toString() ?? uuidv4();
        const startedAt = Date.now();

        request.requestId = requestId;
        response.setHeader('x-request-id', requestId);

        return next.handle().pipe(
            tap({
                next: () => {
                    this.logger.log(
                        JSON.stringify({
                            request_id: requestId,
                            method: request.method,
                            path: request.originalUrl,
                            status_code: response.statusCode,
                            duration_ms: Date.now() - startedAt,
                        }),
                    );
                },
                error: (error: Error) => {
                    this.logger.error(
                        JSON.stringify({
                            request_id: requestId,
                            method: request.method,
                            path: request.originalUrl,
                            status_code: response.statusCode,
                            duration_ms: Date.now() - startedAt,
                            error: error.message,
                        }),
                    );
                },
            }),
        );
    }
}