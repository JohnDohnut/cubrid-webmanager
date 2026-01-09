import { Module } from '@nestjs/common';
import { BrokerController } from './broker.controller';
import { BrokerService } from './broker.service';
import { HostModule } from '@host';
import { CmsHttpsClientModule } from '@cms-https-client/cms-https-client.module';

/**
 * Module for managing broker-related functionalities.
 * Provides broker control operations including start, stop, restart, and list.
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
