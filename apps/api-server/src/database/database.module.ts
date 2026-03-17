import { Module } from '@nestjs/common';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';
import { HostModule } from '@host';
import { CmsHttpsClientModule } from '@cms-https-client/cms-https-client.module';
import { UserRepositoryModule } from '@repository';
import { DatabaseUserController } from './user/database-user.controller';
import { DatabaseUserService } from './user/database-user.service';
import { CmsConfigModule } from '@cms-config/cms-config.module';
import { FileModule } from '@file/file.module';
import { DatabaseInfoModule } from './info/database-info.module';
import { DatabaseLifecycleController } from './lifecycle/database-lifecycle.controller';
import { DatabaseLifecycleService } from './lifecycle/database-lifecycle.service';
import { DatabaseBackupController } from './backup/database-backup.controller';
import { DatabaseBackupService } from './backup/database-backup.service';
import { DatabaseManagementController } from './management/database-management.controller';
import { DatabaseManagementService } from './management/database-management.service';
import { DatabaseConfigController } from './config/database-config.controller';
import { DatabaseConfigService } from './config/database-config.service';

/**
 * Module for managing database functionalities.
 * Provides database start information and management operations.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
  controllers: [
    DatabaseController,
    DatabaseUserController,
    DatabaseLifecycleController,
    DatabaseBackupController,
    DatabaseManagementController,
    DatabaseConfigController,
  ],
  providers: [
    DatabaseService,
    DatabaseUserService,
    DatabaseLifecycleService,
    DatabaseBackupService,
    DatabaseManagementService,
    DatabaseConfigService,
  ],
  imports: [
    HostModule,
    CmsHttpsClientModule,
    UserRepositoryModule,
    CmsConfigModule,
    FileModule,
    DatabaseInfoModule,
  ],
})
export class DatabaseModule {}
