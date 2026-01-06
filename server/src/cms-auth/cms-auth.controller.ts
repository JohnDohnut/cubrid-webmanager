import { Controller, Param, Post, Request } from '@nestjs/common';
import { CmsAuthService } from './cms-auth.service';

/**
 * Controller for handling CMS authentication operations.
 *
 * CMS 인증 작업을 처리하기 위한 컨트롤러입니다.
 * - 모든 엔드포인트는 경로 파라미터로 `hostUid`를 받습니다
 * - RESTful 패턴 준수: /:hostUid/cms-auth/{action}
 *
 * @category Controllers
 * @since 1.0.0
 */
@Controller(':hostUid/cms-auth')
export class CmsAuthController {
    constructor(private readonly cmsAuthService: CmsAuthService) {}

    /**
     * Handles CMS login for a specific host.
     *
     * 특정 호스트에 대한 CMS 로그인을 처리합니다.
     *
     * @route POST /:hostUid/cms-auth/login
     * @param request - The Express request object, containing user information from the JWT.
     * @param hostUid - Host unique identifier from path parameter
     * @returns A boolean indicating successful login.
     * @example
     * // POST /host-uid-1/cms-auth/login
     */
    @Post('login')
    async login(
        @Request() request: any,
        @Param('hostUid') hostUid: string
    ) {
        const userId = request.user.sub;
        const rv = await this.cmsAuthService.login(userId, hostUid) ? true : false
        return rv;
    }
}
