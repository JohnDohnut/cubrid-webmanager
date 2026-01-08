import { Module } from '@nestjs/common';
import { BrokerController } from './broker.controller';
import { BrokerService } from './broker.service';
import { HostModule } from '@host';
import { CmsHttpsClientModule } from '@cms-https-client/cms-https-client.module';

/**
 * Module for managing broker-related functionalities.
 * Provides broker control operations including start, stop, restart, and list.
 *
 * 브로커 관련 기능을 관리하기 위한 모듈입니다.
 * 브로커의 시작, 중지, 재시작, 목록 조회 기능을 제공합니다.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
    controllers: [BrokerController],
    providers: [BrokerService],
    imports : [HostModule, CmsHttpsClientModule],
    exports : [BrokerService]
})
export class BrokerModule {}
