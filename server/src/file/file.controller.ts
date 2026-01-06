import { Controller, Get, Param, Request } from '@nestjs/common';
import { FileService } from './file.service';
import { CheckFileClientResponse } from '@type/index';

/**
 * Controller for file operations.
 * 파일 작업을 관리하는 컨트롤러입니다.
 * 
 * Handles HTTP requests for file management including checking file existence,
 * uploading, downloading, and listing files on CMS hosts.
 * 
 * CMS 호스트에서 파일 존재 확인, 업로드, 다운로드, 목록 조회를 포함한
 * 파일 관리를 위한 HTTP 요청을 처리합니다.
 * - 모든 엔드포인트는 경로 파라미터로 `hostUid`를 받습니다
 * - RESTful 패턴 준수: /:hostUid/file/{action}
 * 
 * @category Controllers
 * @since 1.0.0
 */
@Controller(':hostUid/file')
export class FileController {
    constructor(private readonly fileService: FileService) {}

    /**
     * Check if a file exists on the specified CMS host.
     * 지정된 CMS 호스트에서 파일이 존재하는지 확인합니다.
     * 
     * @route GET /:hostUid/file/checkfile
     * @param request - Express request object containing user payload
     * @param hostUid - Host unique identifier from path parameter
     * @returns Promise<CheckFileClientResponse> File check information
     * @example
     * // POST /host-uid/file/checkfile
     */
    @Get('checkfile')
    async checkFile(
        @Request() request: any,
        @Param('hostUid') hostUid: string
    ): Promise<CheckFileClientResponse> {
        const userId = request.user.sub;
        return await this.fileService.checkFile(userId, hostUid);
    }
}

