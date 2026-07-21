import { loadRuntimeEnv } from './config/load-runtime-env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'module-alias/register';
import * as path from 'path';
import * as fs from 'fs';
import * as express from 'express';
import { getHttpsOptions, logStartupBanner } from '@util';
import { GlobalExceptionFilter } from '@error/global-filter';
import { ConfigService } from '@config/config.service';
import { SuccessResponseInterceptor, LoggingInterceptor } from '@common'; // Updated import

async function bootstrap() {
  loadRuntimeEnv();
  const httpsOptions = getHttpsOptions();
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
    logger: ['error', 'warn'],
  });
  app.getHttpAdapter().getInstance().set('trust proxy', true);
  const configService = app.get(ConfigService);
  const port: string = configService.getPort();
  const listenHost = configService.getListenHost();
  const allowedOrigins = configService.getAllowedOrigins();
  const desktopMode = (process.env.CWM_DESKTOP ?? '').trim() === '1';

  if (allowedOrigins.includes('*')) {
    // Development mode: allow all origins.
    console.log('[main.ts] Enabling CORS for all origins (dev).');
    app.enableCors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true,
    });
  } else if (allowedOrigins.length > 0) {
    // Production with explicit whitelist: only listed origins allowed cross-origin.
    const whitelist = [...allowedOrigins];
    console.log('[main.ts] Production CORS whitelist:', whitelist);
    app.enableCors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) {
          callback(null, true);
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
  // else: ALLOWED_ORIGINS not configured = single-server mode.
  // The browser never applies CORS restrictions to same-origin requests,
  // so no enableCors() call is needed. Cross-origin requests are blocked
  // automatically by the browser (no ACAO header = blocked).

  // Desktop mode uses UDS + Electron proxy that strips /api — no prefix needed.
  if (!desktopMode) {
    app.setGlobalPrefix('api');
  }
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new SuccessResponseInterceptor());

  // Serve web-manager static files.
  // Both pkg (snapshot filesystem) and node use __dirname/public.
  // pkg embeds public/ as assets so __dirname resolves inside the snapshot.
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    const expressApp = app.getHttpAdapter().getInstance();

    // PWA Service Worker registration requires a trusted SSL cert.
    // When ENABLE_PWA is not explicitly set to 'true' in cwm.conf,
    // intercept /registerSW.js with an empty script so SW is never registered.
    // This prevents SecurityError on self-signed certificates.
    const enablePwa = (process.env.ENABLE_PWA ?? '').trim() === 'true';
    if (!enablePwa) {
      // Return a script that actively unregisters any previously installed SW.
      // An empty response would leave stale service workers intercepting
      // requests even after PWA is disabled.
      expressApp.get('/registerSW.js', (_req: express.Request, res: express.Response) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.send(
          `if('serviceWorker'in navigator){` +
          `navigator.serviceWorker.getRegistrations()` +
          `.then(rs=>{for(const r of rs)r.unregister();});}`
        );
      });
    }

    expressApp.use(express.static(publicDir));
    // Exclude both /api and /api/* from SPA fallback.
    // Without (?:/|$) the lookahead /api\/ misses the bare /api path,
    // causing probes and readiness checks to receive index.html 200.
    expressApp.get(/^\/(?!api(?:\/|$)).*/, (_req: express.Request, res: express.Response) => {
      res.sendFile(path.join(publicDir, 'index.html'));
    });
    console.log('\t@ serving web-manager from:', publicDir);
  }

  const unixSocket = configService.getListenUnixSocket();
  if (unixSocket) {
    removeStaleUnixSocket(unixSocket);
    await app.listen(unixSocket);
    logStartupBanner(configService, { kind: 'unixSocket', socketPath: unixSocket });
    return;
  }

  const boundHost = listenHost ?? '0.0.0.0';
  if (listenHost) {
    await app.listen(port, listenHost);
  } else {
    await app.listen(port);
  }
  logStartupBanner(configService, { kind: 'tcp', host: boundHost, port });
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
