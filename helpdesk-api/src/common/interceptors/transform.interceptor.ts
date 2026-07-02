import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Response<T> {
  statusCode: number;
  data: T;
  meta?: PaginatedMeta;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode;
    return next.handle().pipe(
      map((payload) => {
        if (payload && typeof payload === 'object' && 'data' in payload) {
          return { statusCode, ...payload };
        }
        return { statusCode, data: payload };
      }),
    );
  }
}
