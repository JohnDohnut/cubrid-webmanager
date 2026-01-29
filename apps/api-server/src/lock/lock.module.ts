import { Module } from '@nestjs/common';
import { LockService } from './lock.service';

/**
 * Module for managing file locking functionalities.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
  providers: [LockService],
  exports: [LockService],
})
export class LockModule {}
