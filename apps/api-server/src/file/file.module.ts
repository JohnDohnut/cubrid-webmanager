import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { CmsHttpsClientModule } from '@cms-https-client/cms-https-client.module';
import { CmsAuthModule } from '@cms-auth/cms-auth.module';
import { UserRepositoryModule } from '@repository';

/**
 * Module for managing file operations.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
  imports: [CmsHttpsClientModule, CmsAuthModule, UserRepositoryModule],
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}
