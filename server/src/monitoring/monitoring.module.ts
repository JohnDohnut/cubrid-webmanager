import { Module } from '@nestjs/common';
import { HaMonitoringController } from './ha-monitoring/ha-monitoring.controller';
import { HaMonitoringService } from './ha-monitoring/ha-monitoring.service';
import { ResourceMonitoringController } from './resource-monitoring/resource-monitoring.controller';
import { ResourceMonitoringService } from './resource-monitoring/resource-monitoring.service';
import { HostModule } from '@host';
import { CmsHttpsClientModule } from '@cms-https-client/cms-https-client.module';

/**
 * Module for managing monitoring functionalities.
 * Includes HA (High Availability) and resource monitoring operations.
 *
 * 모니터링 기능을 관리하기 위한 모듈입니다.
 * HA(고가용성) 및 리소스 모니터링 작업을 포함합니다.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
    imports: [HostModule, CmsHttpsClientModule],
    controllers: [HaMonitoringController, ResourceMonitoringController],
    providers: [HaMonitoringService, ResourceMonitoringService],
    exports: [HaMonitoringService, ResourceMonitoringService],
})
export class MonitoringModule {}

