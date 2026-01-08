import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CmsHttpsClientService } from './cms-https-client.service';
import { CmsHttpsClientController } from './cms-https-client.controller';
import { HostModule } from '@host';
import { SecurityModule } from '@security';

/**
 * Module for handling CMS HTTPS client communications.
 *
 * CMS HTTPS 클라이언트 통신을 처리하기 위한 모듈입니다.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
    imports: [HttpModule, HostModule, SecurityModule],
    exports: [CmsHttpsClientService],
    providers: [CmsHttpsClientService],
    controllers: [CmsHttpsClientController],
})
export class CmsHttpsClientModule {}
