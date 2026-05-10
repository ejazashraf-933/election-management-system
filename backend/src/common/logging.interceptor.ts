import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, user } = req;
    const start = Date.now();

    this.logger.info(`Incoming Request: ${method} ${url}`, {
      context: 'HTTP',
      user: user?.email ?? 'unauthenticated',
      body: method !== 'GET' ? body : undefined,
    });

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.info(`Response: ${method} ${url} - ${ms}ms`, {
          context: 'HTTP',
        });
      }),
    );
  }
}
