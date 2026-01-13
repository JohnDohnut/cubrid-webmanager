import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

/**
 * Global module for managing application configuration.
 *
 * This module provides and exports the `ConfigService`,
 * making it available throughout the application.
 *
 * @category Modules
 * @since 1.0.0
 */
@Global()
@Module({
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule {}
