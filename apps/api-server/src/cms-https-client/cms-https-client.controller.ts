import {
    Body,
    Controller,
    Param,
    Post,
    Req,
} from '@nestjs/common';
import { CmsHttpsClientService } from './cms-https-client.service';
import { CmsForwardClientRequest } from '@api-interfaces';

/**
 * Controller for handling CMS HTTPS client requests.
 * This controller acts as a proxy to forward authenticated requests to the CMS API.
 *
 * CMS HTTPS 클라이언트 요청을 처리하기 위한 컨트롤러입니다.
 * 이 컨트롤러는 인증된 요청을 CMS API로 전달하는 프록시 역할을 합니다.
 * - 모든 엔드포인트는 경로 파라미터로 `hostUid`를 받습니다
 * - RESTful 패턴 준수: /:hostUid/cms-https-client/{action}
 *
 * @category Controllers
 * @since 1.0.0
 */
@Controller(':hostUid/cms-https-client')
export class CmsHttpsClientController {
    /**
     * @param clientService - The service responsible for forwarding requests to the CMS API.
     *
     * @param clientService - CMS API로 요청을 전달하는 서비스.
     */
    constructor(private readonly clientService: CmsHttpsClientService) {}

    /**
     * Forwards an authenticated request from the client to the CMS API.
     * This endpoint requires JWT authentication. The user's ID is extracted from the JWT,
     * and the host ID is taken from the path parameter. The request body should contain task.
     *
     * 클라이언트로부터의 인증된 요청을 CMS API로 전달합니다.
     * 이 엔드포인트는 JWT 인증을 필요로 합니다. 사용자 ID는 JWT에서 추출되며,
     * 호스트 ID는 경로 파라미터에서 가져옵니다. 요청 본문에는 task가 포함되어야 합니다.
     *
     * @route POST /:hostUid/cms-https-client/forward
     * @param req - The Express request object, containing user information from the JWT.
     * @param hostUid - Host unique identifier from path parameter
     * @param request - The request body from the client, containing task (hostUid is taken from path).
     * @returns A Promise that resolves with the response from the CMS API.
     * @example
     * // POST /host-uid-1/cms-https-client/forward
     * // Body: { "task": "getbrokersinfo" }
     *
     * @param req - JWT에서 사용자 정보를 포함하는 Express 요청 객체.
     * @param hostUid - 경로 파라미터에서 가져온 호스트 고유 식별자
     * @param request - task를 포함한 클라이언트의 요청 본문 (hostUid는 경로에서 가져옴).
     * @returns CMS API의 응답으로 해결되는 Promise.
     */
    @Post('forward')
    async forwardRequest(
        @Req() req,
        @Param('hostUid') hostUid: string,
        @Body() request: Omit<CmsForwardClientRequest, 'hostUid'>
    ) {
        return this.clientService.forwardAuthenticated(
            req.user.sub,
            { ...request, hostUid },
        );
    }
}
