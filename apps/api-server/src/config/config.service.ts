import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Service for managing application configuration.
 *
 * This service handles the parsing and validation of command-line arguments
 * and provides access to configuration values throughout the application.
 * It generates cryptographic keys from provided seed and salt values.
 *
 * @category Infrastructure Services
 * @since 1.0.0
 * @example
 * ```typescript
 * // Start application with required arguments
 * node app.js --SEED=myseed --SALT=mysalt --PORT=8080
 * ```
 */
@Injectable()
export class ConfigService {
  public seed!: string;
  public salt!: string;
  public port: string = '8080';
  public secret_key!: string;
  public environment: string = 'development';
  public allowedOrigins: string[] = [];

  constructor() {
    const args = parseArgs(process.argv.slice(2));

    if (!args.SEED || !args.SALT) {
      throw new Error(
        'SEED and SALT must be provided as command-line arguments (e.g., --SEED=... --SALT=...).'
      );
    }
    this.seed = args.SEED;
    this.salt = args.SALT;

    if (args.PORT) {
      const portNumber = parseInt(args.PORT, 10);
      if (isNaN(portNumber) || portNumber <= 0 || portNumber > 65535) {
        throw new Error(
          `Invalid PORT provided: "${args.PORT}". Port must be a number between 1 and 65535.`
        );
      }
      this.port = args.PORT;
    } else {
      this.port = '8080';
    }

    this.environment = args.ENVIRONMENT || 'development';
    console.log('[ConfigService] Environment:', this.environment);
    this.setAllowedOrigins(args.ALLOWED_ORIGINS);

    const derived = crypto.pbkdf2Sync(this.seed, this.salt, 100_000, 32, 'sha256');
    this.secret_key = derived.toString('hex');
  }

  /**
   * Gets the derived secret key for encryption operations.
   *
   * The secret key is derived from the provided SEED and SALT using PBKDF2
   * with 100,000 iterations and SHA-256 hashing algorithm.
   *
   * @returns The secret key as a hexadecimal string
   */
  getSecretKey(): string {
    return this.secret_key;
  }

  /**
   * Gets the configured port number for the server.
   *
   * @returns The port number as a string (default: '8080')
   */
  getPort(): string {
    return this.port;
  }

  /**
   * Gets the current environment.
   *
   * @returns The environment string ('development' or 'production')
   */
  getEnvironment(): string {
    return this.environment;
  }

  /**
   * Gets the allowed origins for CORS.
   *
   * @returns Array of allowed origins
   */
  getAllowedOrigins(): string[] {
    return this.allowedOrigins;
  }

  /**
   * Sets allowed origins based on environment.
   */
  private setAllowedOrigins(allowedOrigins?: string): void {
    if (this.environment === 'production') {
      if (allowedOrigins) {
        this.allowedOrigins = allowedOrigins.split(',');
      } else {
        this.allowedOrigins = []; // Default to no origins in production if not specified
      }
    } else {
      this.allowedOrigins = ['*'];
    }
    console.log('[ConfigService] Allowed Origins:', this.allowedOrigins); // DEBUG
  }
}

function parseArgs(argv: string[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (const arg of argv) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      result[key] = value;
    }
  }

  return result;
}
