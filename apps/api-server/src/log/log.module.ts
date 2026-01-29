import { Module } from '@nestjs/common';
import { LogController } from './log.controller';
import { LogService } from './log.service';
import { CmsHttpsClientModule } from '@cms-https-client/cms-https-client.module';
import { HostModule } from '@host';

@Module({
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService],
  imports: [CmsHttpsClientModule, HostModule],
})
export class LogModule {}
