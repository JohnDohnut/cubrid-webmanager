import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { AuthError } from '@error/auth/auth-error';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);
        return isPublic ? true : super.canActivate(context);
    }
    handleRequest<TUser = any>(
        err: any,
        user: any,
        info: any,
        context: ExecutionContext,
        status?: any,
    ): TUser {
        // 사용자가 null이거나 undefined인 경우 (JWT 전략에서 검증 실패)
        if (!user) {
            throw AuthError.InvalidToken(
                { userId: 'unknown' },
                new Error('User not found or invalid token'),
            );
        }

        if (
            info instanceof TokenExpiredError ||
            info instanceof JsonWebTokenError
        ) {
            throw AuthError.InvalidToken(
                { userId: user?.sub || 'unknown' },
                info,
            );
        } else if (err instanceof Error) {
            throw AuthError.InternalError(
                { userId: user?.sub || 'unknown' },
                err,
            );
        }
        return super.handleRequest(err, user, info, context, status);
    }
}
