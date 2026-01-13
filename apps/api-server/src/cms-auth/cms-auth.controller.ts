import { Controller, Param, Post, Request } from '@nestjs/common';
import { CmsAuthService } from './cms-auth.service';

/**
 * Controller for handling CMS authentication operations.
 * - All endpoints receive `hostUid` as a path parameter
 * - Follows RESTful pattern: /:hostUid/cms-auth/{action}
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
