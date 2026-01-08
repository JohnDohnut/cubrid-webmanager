import { Module } from '@nestjs/common';
import { CmsConfigController } from './cms-config.controller';
import { CmsConfigService } from './cms-config.service';
import { HostModule } from '@host';
import { CmsHttpsClientModule } from '@cms-https-client/cms-https-client.module';

/**
 * Module for managing CMS configuration operations.
 *
 * Provides functionality to retrieve environment information from CMS hosts
 * including CUBRID version, broker version, database paths, and system information.
 *
 * CMS 구성 작업을 관리하기 위한 모듈입니다.
 *
 * CUBRID 버전, 브로커 버전, 데이터베이스 경로, 시스템 정보 등
 * CMS 호스트의 환경 정보를 조회하는 기능을 제공합니다.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
    imports: [HostModule, CmsHttpsClientModule],
    controllers: [CmsConfigController],
    providers: [CmsConfigService],
    exports: [CmsConfigService],
})
export class CmsConfigModule {}
