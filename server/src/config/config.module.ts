import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

/**
 * Global module for managing application configuration.
 * 애플리케이션 구성을 관리하기 위한 전역 모듈입니다.
 *
 * This module provides and exports the `ConfigService`,
 * making it available throughout the application.
 *
 * 이 모듈은 `ConfigService`를 제공하고 내보내어
 * 애플리케이션 전체에서 사용할 수 있도록 합니다.
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
