import { AuthModule } from '@auth';
import { BrokerModule } from '@broker';
import { ConfigModule } from '@config/config.module';
import { ConfigService } from '@config/config.service';
import { HostModule } from '@host';
import { LockModule } from '@lock';
import { MonitoringModule } from '@monitoring';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UserRepositoryModule } from '@repository';
import { EncryptionService, SecurityModule } from '@security';
import { StorageModule, StorageService } from '@storage';
import { JwtAuthGuard, TokenModule } from '@token';
import { UserModule } from '@user';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CmsAuthModule } from '@cms-auth/cms-auth.module';
import { CmsConfigModule } from '@cms-config/cms-config.module';
import { FileModule } from '@file/file.module';
import { DatabaseModule } from '@database/database.module';
import { CmsHttpsClientModule } from '@cms-https-client/cms-https-client.module';
import { LogModule } from './log/log.module';

/**
 * Root application module that configures all feature modules and global providers.
 * 모든 기능 모듈과 전역 프로바이더를 구성하는 루트 애플리케이션 모듈입니다.
 *
 * This module serves as the main entry point for the WebCA server application,
 * importing all necessary feature modules and configuring global providers
 * including JWT authentication guard.
 *
 * 이 모듈은 WebCA 서버 애플리케이션의 주요 진입점 역할을 하며,
 * 필요한 모든 기능 모듈을 가져오고 JWT 인증 가드를 포함한 전역 프로바이더를 구성합니다.
 *
 * @category Modules
 * @since 1.0.0
 */
@Module({
    imports: [
        ConfigModule,
        SecurityModule,
        StorageModule,
        AuthModule,
        UserRepositoryModule,
        UserModule,
        TokenModule,
        MonitoringModule,
        BrokerModule,
        HostModule,
        LockModule,
        CmsAuthModule,
        CmsConfigModule,
        FileModule,
        DatabaseModule,
        CmsHttpsClientModule,
        LogModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        ConfigService,
        EncryptionService,
        StorageService,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
    ],
})
export class AppModule {}

// Export controllers and services for documentation
export { AppController } from './app.controller';
export { AppService } from './app.service';
