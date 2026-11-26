import { Module } from '@nestjs/common';
import { HaService } from './ha.service';
import { HostModule } from '@host';
import { CmsHttpsClientModule } from '@cms-https-client/cms-https-client.module';
import { HaController } from './ha.controller';
import { HaJobRegistry } from './ha-job-registry';
import { DatabaseUserModule } from '@database/user/database-user.module';

@Module({
  imports: [HostModule, CmsHttpsClientModule, DatabaseUserModule],
  controllers: [HaController],
  providers: [HaService, HaJobRegistry],
  exports: [HaService],
})
export class HaModule {}