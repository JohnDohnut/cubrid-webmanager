import { Module } from '@nestjs/common';
import { CmsAuthService } from './cms-auth.service';
import { CmsAuthController } from './cms-auth.controller';
import { CmsHttpsClientModule } from '@cms-https-client/cms-https-client.module';
import { CmsConfigModule } from '@cms-config/cms-config.module';
import { HaModule } from '@ha';
import { UserRepositoryModule } from '@repository';

/**
 * Module for handling CMS authentication functionalities.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
  imports: [CmsHttpsClientModule, UserRepositoryModule, CmsConfigModule, HaModule],
  providers: [CmsAuthService],
  controllers: [CmsAuthController],
  exports: [CmsAuthService],
})
export class CmsAuthModule {}
