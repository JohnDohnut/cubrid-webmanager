import { Module } from '@nestjs/common';
import { CmsHttpsClientModule } from '@cms-https-client/cms-https-client.module';
import { HostModule } from '@host';
import { CmsUserController } from './cms-user.controller';
import { CmsUserService } from './cms-user.service';

/**
 * Module for CMS (DBMT) user management: get list, update, delete, set password.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
  imports: [HostModule, CmsHttpsClientModule],
  controllers: [CmsUserController],
  providers: [CmsUserService],
  exports: [CmsUserService],
})
export class CmsUserModule {}
