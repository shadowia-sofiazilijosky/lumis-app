import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Reads `request.user` (populated by whichever passport strategy ran).
 * The declared parameter type at the call site (e.g. `@CurrentUser() user: AuthenticatedUser`)
 * is trusted as-is — TypeScript doesn't type-check parameter decorators against it.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
