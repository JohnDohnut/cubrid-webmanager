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
    const allowedOrigins = configService.getAllowedOrigins();
    console.log('[main.ts] Allowed Origins from ConfigService:', allowedOrigins);

    if (allowedOrigins.includes('*')) {
        console.log('[main.ts] Enabling CORS for all origins.');
        app.enableCors({
            origin: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
            credentials: true,
        });
    } else {
        // localhost로 시작하는 모든 origin 허용
        const whitelist = [...allowedOrigins];
        console.log('[main.ts] Production CORS whitelist:', whitelist);
        app.enableCors({
            origin: (origin, callback) => {
                console.log('[main.ts] Received Origin header:', origin);
                // origin이 없으면 (같은 origin 요청 등) 허용
                if (!origin) {
                    callback(null, true);
                    return;
                }
                // localhost로 시작하는 모든 origin 허용
                if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
                    callback(null, true);
                    return;
                }
                // whitelist에 있는 origin 허용
                if (whitelist.includes(origin)) {
                    callback(null, true);
                    return;
                }
                callback(new Error('Not allowed by CORS'));
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
            credentials: true,
        });
    }
    
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(
        new LoggingInterceptor(),
        new SuccessResponseInterceptor()
    );
    await app.listen(port);
    console.log('\t@ server running port :', port);
}
bootstrap();
