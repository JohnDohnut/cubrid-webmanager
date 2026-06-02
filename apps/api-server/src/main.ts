import { loadRuntimeEnv } from './config/load-runtime-env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'module-alias/register';
import * as path from 'path';
import * as fs from 'fs';
import * as express from 'express';
import { getHttpsOptions } from '@util';
import { GlobalExceptionFilter } from '@error/global-filter';
import { ConfigService } from '@config/config.service';
import { SuccessResponseInterceptor, LoggingInterceptor } from '@common'; // Updated import

async function bootstrap() {
  loadRuntimeEnv();
  const httpsOptions = getHttpsOptions();
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.getHttpAdapter().getInstance().set('trust proxy', true);
  const configService = app.get(ConfigService);
  const port: string = configService.getPort();
  const listenHost = configService.getListenHost();
  const allowedOrigins = configService.getAllowedOrigins();
  const desktopMode = (process.env.CWM_DESKTOP ?? '').trim() === '1';
  const trustLocalProxy = (process.env.CWM_TRUST_LOCAL_PROXY ?? '').trim() === '1';
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
    const whitelist = [...allowedOrigins];
    console.log('[main.ts] Production CORS whitelist:', whitelist);
    app.enableCors({
      origin: (origin, callback) => {
        if (!origin) {
          if (desktopMode || trustLocalProxy) {
            callback(null, true);
            return;
          }
          callback(new Error('Not allowed by CORS'));
          return;
        }
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

  // Desktop mode uses UDS + Electron proxy that strips /api — no prefix needed.
  if (!desktopMode) {
    app.setGlobalPrefix('api');
  }
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new SuccessResponseInterceptor());

  // Serve web-manager static files.
  // pkg: public/ is next to the executable.
  // node: public/ is next to the compiled main.js (dist/apps/api-server/public).
  const isPkg = !!(process as any).pkg;
  const publicDir = isPkg
    ? path.join(path.dirname(process.execPath), 'public')
    : path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use(express.static(publicDir));
    expressApp.get(/^\/(?!api\/).*/, (_req: express.Request, res: express.Response) => {
      res.sendFile(path.join(publicDir, 'index.html'));
    });
    console.log('\t@ serving web-manager from:', publicDir);

  const unixSocket = configService.getListenUnixSocket();
  if (unixSocket) {
    removeStaleUnixSocket(unixSocket);
    await app.listen(unixSocket);
    console.log('\t@ server running on unix socket:', unixSocket);
    return;
  }

  if (listenHost) {
    await app.listen(port, listenHost);
    console.log('\t@ server running on', `${listenHost}:${port}`);
    return;
  }
  }

  await app.listen(port);
  console.log('\t@ server running port :', port);
}
bootstrap();

function removeStaleUnixSocket(socketPath: string): void {
  if (process.platform === 'win32') {
    return;
  }

  try {
    fs.unlinkSync(socketPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}
