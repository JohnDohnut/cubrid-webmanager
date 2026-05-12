import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { parseCliArgs } from './parse-cli-args';
import { parseBooleanEnv } from './parse-boolean-env';
import { deriveSecretKeyHexFromSeedSalt } from './master-key';

/**
 * Application configuration from env (after `loadRuntimeEnv`) with optional CLI overrides.
 * Encryption key: PBKDF2(SEED, SALT) — set `SEED` and `SALT` in env or `/etc/cubrid-webmanager.env`.
 *
 * @category Infrastructure Services
 * @since 1.0.0
 */
@Injectable()
export class ConfigService {
  public port: string = '8080';
  public secret_key!: string;
  public environment: string = 'development';
  public allowedOrigins: string[] = [];
  public cmsRejectUnauthorized!: boolean;
  public cmsForwardEnabled!: boolean;
  public authRegistrationEnabled!: boolean;
  private readonly cmsCaCert?: string;

  constructor() {
    const args = parseCliArgs(process.argv.slice(2));

    const seed = args.SEED ?? process.env.SEED;
    const salt = args.SALT ?? process.env.SALT;
    if (!seed || !salt) {
      throw new Error(
        'SEED and SALT are required (env or CLI, e.g. SEED=... SALT=... in .env).'
      );
    }
    this.secret_key = deriveSecretKeyHexFromSeedSalt(seed, salt);

    this.environment = (
      args.ENVIRONMENT ??
      args.ENV ??
      process.env.ENVIRONMENT ??
      'development'
    ).toLowerCase();
    console.log('[ConfigService] Environment:', this.environment);

    this.cmsRejectUnauthorized = this.resolveCmsRejectUnauthorized(args);
    this.cmsForwardEnabled = this.resolveCmsForwardEnabled(args);
    this.authRegistrationEnabled = this.resolveAuthRegistrationEnabled(args);
    this.cmsCaCert = this.resolveCmsCaCert(args);

    if (args.PORT) {
      const portNumber = parseInt(args.PORT, 10);
      if (isNaN(portNumber) || portNumber <= 0 || portNumber > 65535) {
        throw new Error(
          `Invalid PORT provided: "${args.PORT}". Port must be a number between 1 and 65535.`
        );
      }
      this.port = args.PORT;
    } else if (process.env.PORT) {
      const portNumber = parseInt(process.env.PORT, 10);
      if (isNaN(portNumber) || portNumber <= 0 || portNumber > 65535) {
        throw new Error(
          `Invalid PORT in environment: "${process.env.PORT}". Port must be a number between 1 and 65535.`
        );
      }
      this.port = process.env.PORT;
    } else {
      this.port = '8080';
    }

    const allowedFromEnvOrArg =
      args.ALLOWED_ORIGINS ?? process.env.ALLOWED_ORIGINS;
    this.setAllowedOrigins(allowedFromEnvOrArg);
  }

  getSecretKey(): string {
    return this.secret_key;
  }

  getPort(): string {
    return this.port;
  }

  getEnvironment(): string {
    return this.environment;
  }

  isProduction(): boolean {
    return this.environment === 'production';
  }

  getAllowedOrigins(): string[] {
    return this.allowedOrigins;
  }

  getCmsRejectUnauthorized(): boolean {
    return this.cmsRejectUnauthorized;
  }

  getCmsCaCert(): string | undefined {
    return this.cmsCaCert;
  }

  isCmsForwardEnabled(): boolean {
    return this.cmsForwardEnabled;
  }

  isAuthRegistrationEnabled(): boolean {
    return this.authRegistrationEnabled;
  }

  private resolveCmsRejectUnauthorized(args: Record<string, string>): boolean {
    const raw = args.CMS_REJECT_UNAUTHORIZED ?? process.env.CMS_REJECT_UNAUTHORIZED;
    if (raw != null && raw !== '') {
      return parseBooleanEnv(raw);
    }

    return this.isProduction();
  }

  private resolveCmsForwardEnabled(args: Record<string, string>): boolean {
    const raw = args.CMS_FORWARD_ENABLED ?? process.env.CMS_FORWARD_ENABLED;
    if (raw != null && raw !== '') {
      return parseBooleanEnv(raw);
    }

    return !this.isProduction();
  }

  private resolveAuthRegistrationEnabled(args: Record<string, string>): boolean {
    const raw = args.AUTH_REGISTRATION_ENABLED ?? process.env.AUTH_REGISTRATION_ENABLED;
    if (raw != null && raw !== '') {
      return parseBooleanEnv(raw);
    }

    return !this.isProduction();
  }

  private resolveCmsCaCert(args: Record<string, string>): string | undefined {
    const certPath = args.CMS_CA_CERT_PATH ?? process.env.CMS_CA_CERT_PATH;
    if (!certPath) {
      return undefined;
    }

    if (!fs.existsSync(certPath)) {
      throw new Error(`CMS CA certificate file not found: ${certPath}`);
    }

    return fs.readFileSync(certPath, 'utf8');
  }

  private setAllowedOrigins(allowedOrigins?: string): void {
    if (this.isProduction()) {
      if (allowedOrigins) {
        this.allowedOrigins = allowedOrigins.split(',').map((s) => s.trim());
      } else {
        this.allowedOrigins = [];
      }
    } else {
      this.allowedOrigins = ['*'];
    }
    console.log('[ConfigService] Allowed Origins:', this.allowedOrigins);
  }
}
