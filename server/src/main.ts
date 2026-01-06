import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'module-alias/register';
import { getOrCreateSSLCert } from '@util/ssl-util';
import { GlobalExceptionFilter } from '@error/global-filter';
import { ConfigService } from '@config/config.service';
import { SuccessResponseInterceptor, LoggingInterceptor } from '@common'; // Updated import

async function bootstrap() {
    const httpsOptions = getOrCreateSSLCert();
    const app = await NestFactory.create(AppModule, { httpsOptions });
    const configService = app.get(ConfigService);
    const port: string = configService.getPort();
    
    // CORS 설정 - 환경별로 다르게 적용
    const allowedOrigins = configService.getAllowedOrigins();
    console.log('[main.ts] Allowed Origins from ConfigService:', allowedOrigins); // DEBUG

    if (allowedOrigins.includes('*')) {
        // 개발 환경 - 모든 origin 허용
        console.log('[main.ts] Enabling CORS for all origins.'); // DEBUG
        app.enableCors({
            origin: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
            credentials: true,
        });
    } else {
        // 프로덕션 환경 - 설정된 origin 목록 허용
        const whitelist = [...allowedOrigins, 'http://localhost:5173']; // Add localhost for client dev
        console.log('[main.ts] Production CORS whitelist:', whitelist); // DEBUG
        app.enableCors({
            origin: (origin, callback) => {
                console.log('[main.ts] Received Origin header:', origin); // DEBUG
                if (!origin || whitelist.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
            credentials: true,
        });
    }
    
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(
        new LoggingInterceptor(), // Registered first
        new SuccessResponseInterceptor() // Registered second
    );
    await app.listen(port);
    console.log('\t@ server running port :', port);
}
bootstrap();
