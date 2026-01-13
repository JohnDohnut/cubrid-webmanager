import { Module } from '@nestjs/common';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';
import { HostModule } from '@host';
import { CmsHttpsClientModule } from '@cms-https-client/cms-https-client.module';
import { UserRepositoryModule } from '@repository';
import { DatabaseUserController } from './user/database-user.controller';
import { DatabaseUserService } from './user/database-user.service';

/**
 * Module for managing database functionalities.
 * Provides database start information and management operations.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
  controllers: [DatabaseController, DatabaseUserController],
  providers: [DatabaseService, DatabaseUserService],
  imports: [HostModule, CmsHttpsClientModule, UserRepositoryModule]
})
export class DatabaseModule {}

