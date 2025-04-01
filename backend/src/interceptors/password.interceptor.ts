import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class PasswordInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    return next.handle().pipe(map((data) => this.processData(data)));
  }

  private processData(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.processData(item));
    } else if (
      data !== null &&
      typeof data === 'object' &&
      !this.isPrimitiveValue(data)
    ) {
      const rest = Object.fromEntries(
        Object.entries(data as Record<string, unknown>).filter(
          ([key]) => key !== 'password',
        ),
      );

      for (const key in rest) {
        if (rest.hasOwnProperty(key)) {
          rest[key] = this.processData(rest[key]);
        }
      }

      return rest;
    }

    return data;
  }

  private isPrimitiveValue(value: unknown): boolean {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value instanceof Date
    );
  }
}
