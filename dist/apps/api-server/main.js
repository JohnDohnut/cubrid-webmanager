/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = exports.AppController = exports.AppModule = void 0;
const tslib_1 = __webpack_require__(3);
const _auth_1 = __webpack_require__(4);
const _broker_1 = __webpack_require__(194);
const config_module_1 = __webpack_require__(7);
const config_service_1 = __webpack_require__(8);
const _host_1 = __webpack_require__(202);
const _lock_1 = __webpack_require__(273);
const _monitoring_1 = __webpack_require__(276);
const common_1 = __webpack_require__(6);
const core_1 = __webpack_require__(1);
const _repository_1 = __webpack_require__(10);
const _security_1 = __webpack_require__(185);
const _storage_1 = __webpack_require__(282);
const _token_1 = __webpack_require__(186);
const _user_1 = __webpack_require__(283);
const app_controller_1 = __webpack_require__(287);
const app_service_1 = __webpack_require__(288);
const cms_auth_module_1 = __webpack_require__(289);
const cms_config_module_1 = __webpack_require__(292);
const file_module_1 = __webpack_require__(295);
const database_module_1 = __webpack_require__(298);
const cms_https_client_module_1 = __webpack_require__(274);
const log_module_1 = __webpack_require__(303);
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
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            _security_1.SecurityModule,
            _storage_1.StorageModule,
            _auth_1.AuthModule,
            _repository_1.UserRepositoryModule,
            _user_1.UserModule,
            _token_1.TokenModule,
            _monitoring_1.MonitoringModule,
            _broker_1.BrokerModule,
            _host_1.HostModule,
            _lock_1.LockModule,
            cms_auth_module_1.CmsAuthModule,
            cms_config_module_1.CmsConfigModule,
            file_module_1.FileModule,
            database_module_1.DatabaseModule,
            cms_https_client_module_1.CmsHttpsClientModule,
            log_module_1.LogModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            config_service_1.ConfigService,
            _security_1.EncryptionService,
            _storage_1.StorageService,
            { provide: core_1.APP_GUARD, useClass: _token_1.JwtAuthGuard },
        ],
    })
], AppModule);
// Export controllers and services for documentation
var app_controller_2 = __webpack_require__(287);
Object.defineProperty(exports, "AppController", ({ enumerable: true, get: function () { return app_controller_2.AppController; } }));
var app_service_2 = __webpack_require__(288);
Object.defineProperty(exports, "AppService", ({ enumerable: true, get: function () { return app_service_2.AppService; } }));


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = exports.AuthController = exports.AuthModule = void 0;
// Export module
var auth_module_1 = __webpack_require__(5);
Object.defineProperty(exports, "AuthModule", ({ enumerable: true, get: function () { return auth_module_1.AuthModule; } }));
// Export controller
var auth_controller_1 = __webpack_require__(192);
Object.defineProperty(exports, "AuthController", ({ enumerable: true, get: function () { return auth_controller_1.AuthController; } }));
// Export service
var auth_service_1 = __webpack_require__(193);
Object.defineProperty(exports, "AuthService", ({ enumerable: true, get: function () { return auth_service_1.AuthService; } }));


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = exports.AuthController = exports.AuthModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const config_module_1 = __webpack_require__(7);
const _repository_1 = __webpack_require__(10);
const _security_1 = __webpack_require__(185);
const _token_1 = __webpack_require__(186);
const auth_controller_1 = __webpack_require__(192);
const auth_service_1 = __webpack_require__(193);
/**
 * Authentication module for handling user login and registration.
 * 사용자 로그인 및 등록을 처리하기 위한 인증 모듈입니다.
 *
 * This module provides authentication functionality including user login,
 * registration, and JWT token generation. It integrates with the security
 * module for password hashing and the token module for JWT management.
 *
 * 이 모듈은 사용자 로그인, 등록 및 JWT 토큰 생성을 포함한 인증 기능을 제공합니다.
 * 비밀번호 해싱을 위한 보안 모듈 및 JWT 관리를 위한 토큰 모듈과 통합됩니다.
 *
 * @category Modules
 * @since 1.0.0
 */
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService],
        imports: [_security_1.SecurityModule, config_module_1.ConfigModule, _repository_1.UserRepositoryModule, _token_1.TokenModule],
        exports: [],
    })
], AuthModule);
// Export controllers and services for documentation
var auth_controller_2 = __webpack_require__(192);
Object.defineProperty(exports, "AuthController", ({ enumerable: true, get: function () { return auth_controller_2.AuthController; } }));
var auth_service_2 = __webpack_require__(193);
Object.defineProperty(exports, "AuthService", ({ enumerable: true, get: function () { return auth_service_2.AuthService; } }));


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConfigModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const config_service_1 = __webpack_require__(8);
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
let ConfigModule = class ConfigModule {
};
exports.ConfigModule = ConfigModule;
exports.ConfigModule = ConfigModule = tslib_1.__decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [config_service_1.ConfigService],
        exports: [config_service_1.ConfigService],
    })
], ConfigModule);


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConfigService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const crypto = tslib_1.__importStar(__webpack_require__(9));
/**
 * Service for managing application configuration.
 * 애플리케이션 구성을 관리하는 서비스입니다.
 *
 * This service handles the parsing and validation of command-line arguments
 * and provides access to configuration values throughout the application.
 * It generates cryptographic keys from provided seed and salt values.
 *
 * 이 서비스는 명령줄 인수의 구문 분석 및 검증을 처리하고
 * 애플리케이션 전체에서 구성 값에 대한 액세스를 제공합니다.
 * 제공된 시드와 솔트 값으로부터 암호화 키를 생성합니다.
 *
 * @category Infrastructure Services
 * @since 1.0.0
 * @example
 * ```typescript
 * // Start application with required arguments
 * // 필수 인수와 함께 애플리케이션 시작
 * node app.js --SEED=myseed --SALT=mysalt --PORT=8080
 * ```
 */
let ConfigService = class ConfigService {
    constructor() {
        this.port = '8080';
        this.environment = 'development';
        this.allowedOrigins = [];
        const args = parseArgs(process.argv.slice(2));
        if (!args.SEED || !args.SALT) {
            throw new Error('SEED and SALT must be provided as command-line arguments (e.g., --SEED=... --SALT=...).');
        }
        this.seed = args.SEED;
        this.salt = args.SALT;
        if (args.PORT) {
            const portNumber = parseInt(args.PORT, 10);
            if (isNaN(portNumber) || portNumber <= 0 || portNumber > 65535) {
                throw new Error(`Invalid PORT provided: "${args.PORT}". Port must be a number between 1 and 65535.`);
            }
            this.port = args.PORT;
        }
        else {
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
    getSecretKey() {
        return this.secret_key;
    }
    /**
     * Gets the configured port number for the server.
     *
     * @returns The port number as a string (default: '8080')
     */
    getPort() {
        return this.port;
    }
    /**
     * Gets the current environment.
     *
     * @returns The environment string ('development' or 'production')
     */
    getEnvironment() {
        return this.environment;
    }
    /**
     * Gets the allowed origins for CORS.
     *
     * @returns Array of allowed origins
     */
    getAllowedOrigins() {
        return this.allowedOrigins;
    }
    /**
     * Sets allowed origins based on environment.
     */
    setAllowedOrigins(allowedOrigins) {
        if (this.environment === 'production') {
            if (allowedOrigins) {
                this.allowedOrigins = allowedOrigins.split(',');
            }
            else {
                this.allowedOrigins = []; // Default to no origins in production if not specified
            }
        }
        else {
            this.allowedOrigins = ['*'];
        }
        console.log('[ConfigService] Allowed Origins:', this.allowedOrigins); // DEBUG
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], ConfigService);
function parseArgs(argv) {
    const result = {};
    for (const arg of argv) {
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            result[key] = value;
        }
    }
    return result;
}


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserRepositoryService = exports.UserRepositoryModule = void 0;
// Export module
var repository_module_1 = __webpack_require__(11);
Object.defineProperty(exports, "UserRepositoryModule", ({ enumerable: true, get: function () { return repository_module_1.UserRepositoryModule; } }));
// Export services
var user_repository_service_1 = __webpack_require__(66);
Object.defineProperty(exports, "UserRepositoryService", ({ enumerable: true, get: function () { return user_repository_service_1.UserRepositoryService; } }));


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserRepositoryModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const security_module_1 = __webpack_require__(12);
const storage_module_1 = __webpack_require__(17);
const user_repository_service_1 = __webpack_require__(66);
const lock_module_1 = __webpack_require__(65);
/**
 * Module for managing user repository operations.
 *
 * 사용자 리포지토리 작업을 관리하기 위한 모듈입니다.
 *
 * @category Modules
 * @since 1.0.0
 */
let UserRepositoryModule = class UserRepositoryModule {
};
exports.UserRepositoryModule = UserRepositoryModule;
exports.UserRepositoryModule = UserRepositoryModule = tslib_1.__decorate([
    (0, common_1.Module)({
        providers: [user_repository_service_1.UserRepositoryService],
        imports: [security_module_1.SecurityModule, storage_module_1.StorageModule, lock_module_1.LockModule],
        exports: [user_repository_service_1.UserRepositoryService],
    })
], UserRepositoryModule);


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SecurityModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const encryption_service_1 = __webpack_require__(13);
const config_module_1 = __webpack_require__(7);
const password_service_1 = __webpack_require__(14);
const passport_1 = __webpack_require__(16);
/**
 * Module for managing security-related functionalities.
 *
 * 보안 관련 기능을 관리하기 위한 모듈입니다.
 *
 * @category Modules
 * @since 1.0.0
 */
let SecurityModule = class SecurityModule {
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [config_module_1.ConfigModule, passport_1.PassportModule],
        exports: [encryption_service_1.EncryptionService, password_service_1.PasswordService],
        providers: [encryption_service_1.EncryptionService, password_service_1.PasswordService],
    })
], SecurityModule);


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EncryptionService = void 0;
const tslib_1 = __webpack_require__(3);
const config_service_1 = __webpack_require__(8);
const common_1 = __webpack_require__(6);
const crypto = tslib_1.__importStar(__webpack_require__(9));
/**
 * Service for encryption and decryption operations.
 * 암호화 및 복호화 작업을 위한 서비스입니다.
 *
 * Provides functionality for data encryption, decryption, and hashing.
 * Uses AES-256-CBC encryption and SHA-256 hashing algorithms.
 *
 * 데이터 암호화, 복호화, 해싱 기능을 제공합니다.
 * AES-256-CBC 암호화와 SHA-256 해싱 알고리즘을 사용합니다.
 *
 * @category Infrastructure Services
 * @since 1.0.0
 */
let EncryptionService = class EncryptionService {
    constructor(configService) {
        this.configService = configService;
        this.algorithm = 'aes-256-cbc';
    }
    /**
     * Generates a SHA-256 hash of the provided plain text or number.
     * 제공된 평문 텍스트 또는 숫자의 SHA-256 해시를 생성합니다.
     *
     * This method is commonly used for creating consistent identifiers
     * from user IDs or other data that needs to be hashed for storage
     * or comparison purposes.
     *
     * 이 메서드는 사용자 ID나 저장 또는 비교 목적으로 해시가 필요한
     * 기타 데이터로부터 일관된 식별자를 생성하는 데 일반적으로 사용됩니다.
     *
     * @param plain - The string or number to hash / 해시할 문자열 또는 숫자
     * @returns The SHA-256 hash as a hexadecimal string / 16진수 문자열로 된 SHA-256 해시
     * @example
     * ```typescript
     * const hash = encryptionService.getHashedValue("user123");
     * console.log(hash); // "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
     * ```
     */
    getHashedValue(plain) {
        const hash = crypto.createHash('sha256');
        if (typeof plain == 'number') {
            plain = plain.toString();
        }
        return hash.update(plain).digest('hex');
    }
    /**
     * Encrypts a plain text string using AES-256-CBC encryption.
     *
     * The encryption uses a random initialization vector (IV) for each encryption
     * operation, ensuring that the same plaintext produces different ciphertext
     * each time. The result includes both the IV and encrypted data.
     *
     * @param plain - The plain text string to encrypt
     * @returns The encrypted string in format "iv:encryptedData" (both in hex)
     * @example
     * ```typescript
     * const encrypted = encryptionService.encryptValue("sensitive data");
     * console.log(encrypted); // "a1b2c3d4...:e5f6g7h8..."
     * ```
     */
    encryptValue(plain) {
        const key = Buffer.from(this.configService.getSecretKey(), 'hex');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, key, iv);
        const encrypted = Buffer.concat([
            cipher.update(plain, 'utf8'),
            cipher.final(),
        ]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }
    /**
     * Decrypts a cipher text string that was encrypted using encryptValue.
     *
     * The cipher text must be in the format "iv:encryptedData" where both
     * parts are hexadecimal strings. This method extracts the IV and
     * encrypted data to perform the decryption.
     *
     * @param cipher - The encrypted string in format "iv:encryptedData"
     * @returns The decrypted plain text string
     * @throws Error if the cipher format is invalid or decryption fails
     * @example
     * ```typescript
     * const decrypted = encryptionService.decryptValue("a1b2c3d4...:e5f6g7h8...");
     * console.log(decrypted); // "sensitive data"
     * ```
     */
    decryptValue(cipher) {
        const [ivHex, encryptedHex] = cipher.split(':');
        const key = Buffer.from(this.configService.getSecretKey(), 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]);
        return decrypted.toString('utf8');
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof config_service_1.ConfigService !== "undefined" && config_service_1.ConfigService) === "function" ? _a : Object])
], EncryptionService);


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PasswordService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const bcrypt = tslib_1.__importStar(__webpack_require__(15));
/**
 * Service for password hashing and verification operations.
 * 비밀번호 해싱 및 검증 작업을 위한 서비스입니다.
 *
 * Provides functionality for password hashing using bcrypt and
 * password verification for authentication purposes.
 *
 * bcrypt를 사용한 비밀번호 해싱 기능과
 * 인증 목적의 비밀번호 검증 기능을 제공합니다.
 *
 * @category Infrastructure Services
 * @since 1.0.0
 */
let PasswordService = class PasswordService {
    constructor() {
        this.HASH_ROUND = 10;
    }
    /**
     * Compares a plain text password with a hashed password.
     * 평문 비밀번호와 해시된 비밀번호를 비교합니다.
     *
     * @param plain - The plain text password.
     * @param hash - The hashed password.
     * @returns A Promise that resolves to true if the passwords match, false otherwise.
     */
    async comparePlainAndHash(plain, hash) {
        return await bcrypt.compare(plain, hash);
    }
    /**
     * Generates a hash for the given plain text password.
     * 주어진 평문 비밀번호에 대한 해시를 생성합니다.
     *
     * @param plain - The plain text password or number to hash.
     * @returns A Promise that resolves to the hashed password string.
     */
    async getHashedValue(plain) {
        const textPlain = plain.toString();
        const hashed = await bcrypt.hash(textPlain, this.HASH_ROUND);
        return hashed;
    }
};
exports.PasswordService = PasswordService;
exports.PasswordService = PasswordService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], PasswordService);


/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StorageModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const config_module_1 = __webpack_require__(7);
const storage_service_1 = __webpack_require__(18);
const security_module_1 = __webpack_require__(12);
const lock_module_1 = __webpack_require__(65);
/**
 * Module for managing file storage functionalities.
 *
 * 파일 저장소 기능을 관리하기 위한 모듈입니다.
 *
 * @category Modules
 * @since 1.0.0
 */
let StorageModule = class StorageModule {
};
exports.StorageModule = StorageModule;
exports.StorageModule = StorageModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [config_module_1.ConfigModule, security_module_1.SecurityModule, lock_module_1.LockModule],
        exports: [storage_service_1.StorageService],
        providers: [storage_service_1.StorageService],
    })
], StorageModule);


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StorageService = void 0;
const tslib_1 = __webpack_require__(3);
const storage_error_1 = __webpack_require__(19);
const common_1 = __webpack_require__(6);
const resolve_storage_path_1 = __webpack_require__(27);
const fs = tslib_1.__importStar(__webpack_require__(29));
const lock_service_1 = __webpack_require__(30);
const handle_storage_fs_errors_decorator_1 = __webpack_require__(53);
/**
 * Service for managing file storage operations.
 * 파일 스토리지 작업을 관리하는 서비스입니다.
 *
 * Provides functionality for file storage, retrieval, and management.
 * Handles file system operations and storage path resolution.
 *
 * 파일 스토리지, 검색, 관리 기능을 제공합니다.
 * 파일 시스템 작업과 스토리지 경로 해결을 처리합니다.
 *
 * @category Infrastructure Services
 * @since 1.0.0
 */
let StorageService = class StorageService {
    constructor(lockService) {
        this.lockService = lockService;
        this.initializeStorageDirectory();
    }
    /**
     * Initializes the storage directory, creating it if it doesn't exist.
     * 저장소 디렉토리를 초기화하고, 존재하지 않으면 생성합니다.
     *
     * @returns A Promise that resolves when the directory is initialized.
     */
    async initializeStorageDirectory() {
        try {
            await fs.mkdir((0, resolve_storage_path_1.getStoragePath)(), { recursive: true });
        }
        catch (err) {
            if (err?.code !== 'EEXIST') {
                console.warn('Failed to initialize storage directory:', err?.message);
            }
        }
    }
    /**
     * Handles file system errors by translating them into StorageError instances.
     * 파일 시스템 오류를 StorageError 인스턴스로 변환하여 처리합니다.
     *
     * @param err - The original file system error.
     * @throws StorageError - The translated storage error.
     */
    handleFsError(err) {
        switch (err?.code) {
            case 'ENOENT':
                throw storage_error_1.StorageError.NoSuchFile({ filePath: err.path }, err);
            case 'EEXIST':
                throw storage_error_1.StorageError.AlreadyExists({ filePath: err.path }, err);
            case 'EACCES':
            case 'EPERM':
                throw storage_error_1.StorageError.PermissionDenied({ filePath: err.path }, err);
            default:
                throw storage_error_1.StorageError.Unknown({
                    originalCode: err?.code,
                    originalMessage: err?.message,
                }, err);
        }
    }
    /**
     * Resolves the absolute file path for a given filename within the storage directory.
     * 저장소 디렉토리 내에서 주어진 파일 이름에 대한 절대 파일 경로를 확인합니다.
     *
     * @param filename - The name of the file.
     * @returns The absolute path to the file.
     */
    resolveFilePath(filename) {
        return (0, resolve_storage_path_1.resolveUserFilePath)(filename);
    }
    /**
     * Reads the content of a file without acquiring a lock.
     * This method is considered unsafe for concurrent access.
     *
     * 잠금을 획득하지 않고 파일 내용을 읽습니다.
     * 이 메서드는 동시 액세스에 안전하지 않습니다.
     *
     * @param filename - The name of the file to read.
     * @returns A Promise that resolves with the file content as a string.
     * @throws StorageError if the file cannot be read.
     */
    async readUnsafe(filename) {
        const filePath = (0, resolve_storage_path_1.resolveUserFilePath)(filename);
        return await fs.readFile(filePath, 'utf-8');
    }
    /**
     * Reads the content of a file, ensuring atomic access using a file lock.
     * 파일 잠금을 사용하여 원자적 액세스를 보장하면서 파일 내용을 읽습니다.
     *
     * @param filename - The name of the file to read.
     * @returns A Promise that resolves with the file content as a string.
     * @throws StorageError if the file cannot be read or the lock cannot be acquired/released.
     */
    async read(filename) {
        return this.lockService.withLock(filename, async () => {
            return await this.readUnsafe(filename);
        });
    }
    /**
     * Writes data to a file without acquiring a lock, using a temporary file for atomic writes.
     * 이 메서드는 잠금을 획득하지 않고 임시 파일을 사용하여 원자적으로 데이터를 파일에 씁니다.
     *
     * This method is considered unsafe for concurrent access if not wrapped by a locking mechanism.
     * 잠금 메커니즘으로 래핑되지 않으면 동시 액세스에 안전하지 않습니다.
     *
     * @param filename - The name of the file to write to.
     * @param data - The data to write to the file.
     * @returns A Promise that resolves when the data is written.
     * @throws StorageError if the file cannot be written.
     */
    async writeUnsafe(filename, data) {
        const filePath = (0, resolve_storage_path_1.resolveUserFilePath)(filename);
        const tmp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
        await fs.writeFile(tmp, data, 'utf-8');
        await fs.rename(tmp, filePath);
        await fs.rm(tmp, { force: true });
    }
    /**
     * Writes data to a file, ensuring atomic access using a file lock.
     * 파일 잠금을 사용하여 원자적 액세스를 보장하면서 파일에 데이터를 씁니다.
     *
     * @param filename - The name of the file to write to.
     * @param data - The data to write to the file.
     * @returns A Promise that resolves when the data is written.
     * @throws StorageError if the file cannot be written or the lock cannot be acquired/released.
     */
    async write(filename, data) {
        return this.lockService.withLock(filename, async () => {
            return this.writeUnsafe(filename, data);
        });
    }
    /**
     * Creates an empty file without acquiring a lock.
     * 잠금을 획득하지 않고 빈 파일을 생성합니다.
     *
     * This method is considered unsafe for concurrent access.
     * 이 메서드는 동시 액세스에 안전하지 않습니다.
     *
     * @param filename - The name of the file to create.
     * @returns A Promise that resolves when the file is created.
     * @throws StorageError if the file already exists or cannot be created.
     */
    async createUnsafe(filename) {
        const filePath = (0, resolve_storage_path_1.resolveUserFilePath)(filename);
        await fs.mkdir((0, resolve_storage_path_1.getStoragePath)(), { recursive: true });
        await fs.writeFile(filePath, '', { flag: 'wx' });
    }
    /**
     * Creates an empty file, ensuring atomic access using a file lock.
     * 파일 잠금을 사용하여 원자적 액세스를 보장하면서 빈 파일을 생성합니다.
     *
     * @param filename - The name of the file to create.
     * @returns A Promise that resolves with the filename when the file is created.
     * @throws StorageError if the file already exists or cannot be created, or the lock fails.
     */
    async create(filename) {
        return this.lockService.withLock(filename, async () => {
            await this.createUnsafe(filename);
            return filename;
        });
    }
    /**
     * Creates and writes data to a file without acquiring a lock.
     * 잠금을 획득하지 않고 파일을 생성하고 데이터를 씁니다.
     *
     * This method is considered unsafe for concurrent access.
     * 이 메서드는 동시 액세스에 안전하지 않습니다.
     *
     * @param filename - The name of the file to create and write to.
     * @param data - The data to write to the file.
     * @returns A Promise that resolves when the file is created and data is written.
     * @throws StorageError if the file already exists or cannot be created/written.
     */
    async createAndWriteUnsafe(filename, data) {
        const filePath = (0, resolve_storage_path_1.resolveUserFilePath)(filename);
        await fs.mkdir((0, resolve_storage_path_1.getStoragePath)(), { recursive: true });
        await fs.writeFile(filePath, data, { flag: 'wx', encoding: 'utf-8' });
    }
    /**
     * Creates and writes data to a file, ensuring atomic access using a file lock.
     * 파일 잠금을 사용하여 원자적 액세스를 보장하면서 파일을 생성하고 데이터를 씁니다.
     *
     * @param filename - The name of the file to create and write to.
     * @param data - The data to write to the file.
     * @returns A Promise that resolves with the filename when the operation is complete.
     * @throws StorageError if the file already exists or cannot be created/written, or the lock fails.
     */
    async createAndWrite(filename, data) {
        return this.lockService.withLock(filename, async () => {
            await this.createAndWriteUnsafe(filename, data);
            return filename;
        });
    }
    /**
     * Deletes a file without acquiring a lock.
     * 잠금을 획득하지 않고 파일을 삭제합니다.
     *
     * This method is considered unsafe for concurrent access.
     * 이 메서드는 동시 액세스에 안전하지 않습니다.
     *
     * @param filename - The name of the file to delete.
     * @returns A Promise that resolves when the file is deleted.
     * @throws StorageError if the file cannot be deleted.
     */
    async deleteUnsafe(filename) {
        const filePath = (0, resolve_storage_path_1.resolveUserFilePath)(filename);
        await fs.rm(filePath, { force: true });
    }
    /**
     * Deletes a file, ensuring atomic access using a file lock.
     * 파일 잠금을 사용하여 원자적 액세스를 보장하면서 파일을 삭제합니다.
     *
     * @param filename - The name of the file to delete.
     * @returns A Promise that resolves when the file is deleted.
     * @throws StorageError if the file cannot be deleted or the lock fails.
     */
    async delete(filename) {
        return this.lockService.withLock(filename, async () => {
            return this.deleteUnsafe(filename);
        });
    }
};
exports.StorageService = StorageService;
tslib_1.__decorate([
    (0, handle_storage_fs_errors_decorator_1.HandleStorageFsErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], StorageService.prototype, "readUnsafe", null);
tslib_1.__decorate([
    (0, handle_storage_fs_errors_decorator_1.HandleStorageFsErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], StorageService.prototype, "read", null);
tslib_1.__decorate([
    (0, handle_storage_fs_errors_decorator_1.HandleStorageFsErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], StorageService.prototype, "writeUnsafe", null);
tslib_1.__decorate([
    (0, handle_storage_fs_errors_decorator_1.HandleStorageFsErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], StorageService.prototype, "createUnsafe", null);
tslib_1.__decorate([
    (0, handle_storage_fs_errors_decorator_1.HandleStorageFsErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], StorageService.prototype, "createAndWriteUnsafe", null);
tslib_1.__decorate([
    (0, handle_storage_fs_errors_decorator_1.HandleStorageFsErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], StorageService.prototype, "deleteUnsafe", null);
exports.StorageService = StorageService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof lock_service_1.LockService !== "undefined" && lock_service_1.LockService) === "function" ? _a : Object])
], StorageService);


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StorageError = exports.StorageErrorCode = void 0;
const app_error_1 = __webpack_require__(20);
const storage_error_code_1 = __webpack_require__(22);
Object.defineProperty(exports, "StorageErrorCode", ({ enumerable: true, get: function () { return storage_error_code_1.StorageErrorCode; } }));
/**
 * Error class for storage-related operations.
 * 저장소 관련 작업을 위한 오류 클래스입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
class StorageError extends app_error_1.AppError {
    constructor(kind, code, additionalData, originalError) {
        super(kind, code, additionalData, originalError);
    }
    /**
     * Creates an error indicating that a file was not found.
     *
     * 파일을 찾을 수 없음을 나타내는 오류를 생성합니다.
     */
    static NoSuchFile(additionalData, originalError) {
        return new StorageError('STORAGE', storage_error_code_1.StorageErrorCode.NO_SUCH_FILE, additionalData, originalError);
    }
    /**
     * Creates an error indicating that a file was not found.
     * @deprecated Use NoSuchFile instead
     *
     * 파일을 찾을 수 없음을 나타내는 오류를 생성합니다.
     * @deprecated NoSuchFile을 사용하세요
     */
    static NotFound(additionalData, originalError) {
        return new StorageError('STORAGE', storage_error_code_1.StorageErrorCode.FILE_NOT_FOUND, additionalData, originalError);
    }
    /**
     * Creates an error indicating that permission was denied for a file operation.
     *
     * 파일 작업에 대한 권한이 거부되었음을 나타내는 오류를 생성합니다.
     */
    static PermissionDenied(additionalData, originalError) {
        return new StorageError('STORAGE', storage_error_code_1.StorageErrorCode.PERMISSION_DENIED, additionalData, originalError);
    }
    /**
     * Creates an error indicating that a file already exists.
     *
     * 파일이 이미 존재함을 나타내는 오류를 생성합니다.
     */
    static AlreadyExists(additionalData, originalError) {
        return new StorageError('STORAGE', storage_error_code_1.StorageErrorCode.FILE_ALREADY_EXISTS, additionalData, originalError);
    }
    /**
     * Creates an error for an unknown storage-related issue.
     *
     * 알 수 없는 저장소 관련 문제를 나타내는 오류를 생성합니다.
     */
    static Unknown(additionalData, originalError) {
        return new StorageError('STORAGE', storage_error_code_1.StorageErrorCode.UNKNOWN, additionalData, originalError);
    }
}
exports.StorageError = StorageError;


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppError = void 0;
const auth_error_code_1 = __webpack_require__(21);
const storage_error_code_1 = __webpack_require__(22);
const lock_error_code_1 = __webpack_require__(23);
const host_error_code_1 = __webpack_require__(24);
const user_error_code_1 = __webpack_require__(25);
const database_error_code_1 = __webpack_require__(26);
/**
 * Base error class for all application errors.
 *
 * @category Errors
 * @since 1.0.0
 */
class AppError extends Error {
    constructor(kind, code, additionalData, originalError) {
        super(code);
        this.kind = kind;
        this.code = code;
        this.additionalData = additionalData;
        this.originalError = originalError;
        this.name = new.target.name;
    }
    toProblemDetails(requestUrl) {
        const baseResponse = {
            type: `/errors/${this.kind.toLowerCase()}/${this.code.toLowerCase()}`,
            title: this.code
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() +
                word.slice(1).toLowerCase())
                .join(' '),
            status: this.getHttpStatus(),
            detail: this.message,
            code: this.code,
        };
        if (this.additionalData) {
            const safeFields = this.getSafeFieldsForClient(this.additionalData);
            if (Object.keys(safeFields).length > 0) {
                return { ...baseResponse, ...safeFields };
            }
        }
        return baseResponse;
    }
    /**
     * 클라이언트에 안전하게 노출할 수 있는 필드만 필터링합니다.
     * 보안상 민감한 정보는 제외합니다.
     *
     * @private
     */
    getSafeFieldsForClient(additionalData) {
        const safeFields = {};
        const allowedFields = [
            'missingFields',
            'dbname',
            'bname',
            'message',
        ];
        const sensitiveFields = [
            'response',
            'stack',
            'originalError',
            'hostUid',
            'userId',
            'password',
            'token',
            'address',
            'port',
        ];
        for (const [key, value] of Object.entries(additionalData)) {
            if (allowedFields.includes(key) && !sensitiveFields.includes(key)) {
                safeFields[key] = value;
            }
        }
        return safeFields;
    }
    toLogDetails(requestUrl) {
        return {
            type: `/errors/${this.kind.toLowerCase()}/${this.code.toLowerCase()}`,
            title: this.code
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() +
                word.slice(1).toLowerCase())
                .join(' '),
            status: this.getHttpStatus(),
            detail: this.message,
            instance: requestUrl || '',
            kind: this.kind,
            code: this.code,
            timestamp: new Date().toISOString(),
            ...(this.additionalData || {}),
            ...(this.originalError
                ? {
                    originalError: {
                        name: this.originalError.name,
                        message: this.originalError.message,
                        stack: this.originalError.stack,
                    },
                }
                : {}),
        };
    }
    getHttpStatus() {
        switch (this.kind) {
            case 'AUTH':
                switch (this.code) {
                    case auth_error_code_1.AuthErrorCode.INVALID_CREDENTIALS:
                    case auth_error_code_1.AuthErrorCode.INVALID_TOKEN:
                        return 401;
                    case auth_error_code_1.AuthErrorCode.PERMISSION_DENIED:
                        return 403;
                    case auth_error_code_1.AuthErrorCode.INTERNAL_ERROR:
                        return 500;
                    case auth_error_code_1.AuthErrorCode.UNKNOWN:
                        return 500;
                    default:
                        return 401;
                }
            case 'RESOURCE':
                // Subdivide RESOURCE errors
                switch (this.code) {
                    case host_error_code_1.HostErrorCode.NO_SUCH_HOST:
                        return 404; // Not Found
                    case host_error_code_1.HostErrorCode.EXCEED_MAX_HOSTS:
                    case host_error_code_1.HostErrorCode.INVALID_FORMAT:
                        return 400;
                    case host_error_code_1.HostErrorCode.DUPLICATED_HOST:
                        return 409; // Conflict - resource collision
                    case host_error_code_1.HostErrorCode.INTERNAL_ERROR:
                        return 500; // Internal Server Error
                    default:
                        return 400;
                }
            case 'USER':
                switch (this.code) {
                    case user_error_code_1.UserErrorCode.USER_NOT_FOUND:
                        return 404; // Not Found
                    case user_error_code_1.UserErrorCode.USER_ALREADY_EXISTS:
                        return 409; // Conflict - resource already exists
                    case user_error_code_1.UserErrorCode.DATA_SAVE_FAILED:
                    case user_error_code_1.UserErrorCode.DATA_LOAD_FAILED:
                    case user_error_code_1.UserErrorCode.DATA_DELETE_FAILED:
                    case user_error_code_1.UserErrorCode.DATA_UPDATE_FAILED:
                        return 500; // Internal server error
                    case user_error_code_1.UserErrorCode.RESOURCE_LOCKED:
                        return 423; // Locked - resource is locked
                    case user_error_code_1.UserErrorCode.LOCK_OPERATION_FAILED:
                        return 500; // Internal server error
                    case user_error_code_1.UserErrorCode.OLD_PASSWORD_MISMATCH:
                    case user_error_code_1.UserErrorCode.BAD_NEW_PASSWORD:
                        return 400; // Bad request
                    case user_error_code_1.UserErrorCode.UNKNOWN:
                        return 500; // Internal server error
                    default:
                        return 500;
                }
            case 'STORAGE':
                switch (this.code) {
                    case storage_error_code_1.StorageErrorCode.NO_SUCH_FILE:
                    case storage_error_code_1.StorageErrorCode.FILE_NOT_FOUND: // Deprecated
                    case storage_error_code_1.StorageErrorCode.FILE_ALREADY_EXISTS:
                        return 400;
                    case storage_error_code_1.StorageErrorCode.PERMISSION_DENIED:
                        return 403;
                    case storage_error_code_1.StorageErrorCode.UNKNOWN:
                        return 500;
                    default:
                        return 500;
                }
            case 'LOCK':
                switch (this.code) {
                    case lock_error_code_1.LockErrorCode.LOCK_NOT_FOUND:
                        return 404; // Not Found
                    case lock_error_code_1.LockErrorCode.PERMISSION_DENIED:
                        return 403;
                    case lock_error_code_1.LockErrorCode.LOCK_ALREADY_HELD:
                        return 409;
                    case lock_error_code_1.LockErrorCode.STALE_LOCK:
                        return 410; // Gone - expired lock
                    case lock_error_code_1.LockErrorCode.UNKNOWN:
                        return 500;
                    default:
                        return 500;
                }
            case 'INTERNAL':
                return 500;
            case 'DATABASE':
                switch (this.code) {
                    case database_error_code_1.DatabaseErrorCode.NO_SUCH_DATABASE:
                        return 404;
                    case database_error_code_1.DatabaseErrorCode.DUPLICATED_DATABASE_PROFILE:
                        return 409;
                    case database_error_code_1.DatabaseErrorCode.INTERNAL_ERROR:
                    case database_error_code_1.DatabaseErrorCode.GET_START_INFO_FAILED:
                    case database_error_code_1.DatabaseErrorCode.START_DATABASE_FAILED:
                    case database_error_code_1.DatabaseErrorCode.STOP_DATABASE_FAILED:
                    case database_error_code_1.DatabaseErrorCode.RESTART_DATABASE_FAILED:
                    case database_error_code_1.DatabaseErrorCode.LOGIN_DATABASE_FAILED:
                    case database_error_code_1.DatabaseErrorCode.GET_DB_SPACE_INFO_FAILED:
                        return 500;
                    default:
                        return 500;
                }
            case 'CMS':
                return 500;
            case 'VALIDATION':
                return 400;
            default:
                return 500;
        }
    }
}
exports.AppError = AppError;


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthErrorCode = void 0;
/**
 * Enumeration of authentication error codes.
 *
 * 인증 오류 코드 열거형입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
var AuthErrorCode;
(function (AuthErrorCode) {
    AuthErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    AuthErrorCode["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    AuthErrorCode["INVALID_TOKEN"] = "INVALID_TOKEN";
    AuthErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    AuthErrorCode["UNKNOWN"] = "UNKNOWN";
})(AuthErrorCode || (exports.AuthErrorCode = AuthErrorCode = {}));


/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StorageErrorCode = void 0;
/**
 * Enumeration of storage-related error codes.
 *
 * 저장소 관련 오류 코드 열거형입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
var StorageErrorCode;
(function (StorageErrorCode) {
    StorageErrorCode["NO_SUCH_FILE"] = "NO_SUCH_FILE";
    StorageErrorCode["FILE_NOT_FOUND"] = "FILE_NOT_FOUND";
    StorageErrorCode["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    StorageErrorCode["FILE_ALREADY_EXISTS"] = "FILE_ALREADY_EXISTS";
    StorageErrorCode["UNKNOWN"] = "UNKNOWN";
})(StorageErrorCode || (exports.StorageErrorCode = StorageErrorCode = {}));


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LockErrorCode = void 0;
/**
 * Enumeration of lock-related error codes.
 *
 * 잠금 관련 오류 코드 열거형입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
var LockErrorCode;
(function (LockErrorCode) {
    LockErrorCode["LOCK_NOT_FOUND"] = "LOCK_NOT_FOUND";
    LockErrorCode["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    LockErrorCode["LOCK_ALREADY_HELD"] = "LOCK_ALREADY_HELD";
    LockErrorCode["STALE_LOCK"] = "STALE_LOCK";
    LockErrorCode["UNKNOWN"] = "UNKNOWN";
})(LockErrorCode || (exports.LockErrorCode = LockErrorCode = {}));


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HostErrorCode = void 0;
/**
 * Enumeration of host-related error codes.
 *
 * 호스트 관련 오류 코드 열거형입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
var HostErrorCode;
(function (HostErrorCode) {
    HostErrorCode["EXCEED_MAX_HOSTS"] = "EXCEED_MAX_HOSTS";
    HostErrorCode["INVALID_FORMAT"] = "INVALID_FORMAT";
    HostErrorCode["DUPLICATED_HOST"] = "DUPLICATED_HOST";
    HostErrorCode["NO_SUCH_HOST"] = "NO_SUCH_HOST";
    HostErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
})(HostErrorCode || (exports.HostErrorCode = HostErrorCode = {}));


/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserErrorCode = void 0;
/**
 * Enumeration of user-related error codes.
 *
 * 사용자 관련 오류 코드 열거형입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
var UserErrorCode;
(function (UserErrorCode) {
    UserErrorCode["USER_NOT_FOUND"] = "USER_NOT_FOUND";
    UserErrorCode["USER_ALREADY_EXISTS"] = "USER_ALREADY_EXISTS";
    UserErrorCode["DATA_SAVE_FAILED"] = "DATA_SAVE_FAILED";
    UserErrorCode["DATA_LOAD_FAILED"] = "DATA_LOAD_FAILED";
    UserErrorCode["DATA_DELETE_FAILED"] = "DATA_DELETE_FAILED";
    UserErrorCode["DATA_UPDATE_FAILED"] = "DATA_UPDATE_FAILED";
    UserErrorCode["RESOURCE_LOCKED"] = "RESOURCE_LOCKED";
    UserErrorCode["LOCK_OPERATION_FAILED"] = "LOCK_OPERATION_FAILED";
    UserErrorCode["OLD_PASSWORD_MISMATCH"] = "OLD_PASSWORD_MISMATCH";
    UserErrorCode["BAD_NEW_PASSWORD"] = "BAD_NEW_PASSWORD";
    UserErrorCode["UNKNOWN"] = "UNKNOWN";
})(UserErrorCode || (exports.UserErrorCode = UserErrorCode = {}));


/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseErrorCode = void 0;
/**
 * Enumeration of database-related error codes.
 *
 * 데이터베이스 관련 오류 코드 열거형입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
var DatabaseErrorCode;
(function (DatabaseErrorCode) {
    DatabaseErrorCode["GET_START_INFO_FAILED"] = "GET_START_INFO_FAILED";
    DatabaseErrorCode["START_DATABASE_FAILED"] = "START_DATABASE_FAILED";
    DatabaseErrorCode["STOP_DATABASE_FAILED"] = "STOP_DATABASE_FAILED";
    DatabaseErrorCode["RESTART_DATABASE_FAILED"] = "RESTART_DATABASE_FAILED";
    DatabaseErrorCode["LOGIN_DATABASE_FAILED"] = "LOGIN_DATABASE_FAILED";
    DatabaseErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    DatabaseErrorCode["DUPLICATED_DATABASE_PROFILE"] = "DUPLICATED_DATABASE_PROFILE";
    DatabaseErrorCode["NO_SUCH_DATABASE"] = "NO_SUCH_DATABASE";
    DatabaseErrorCode["GET_DB_SPACE_INFO_FAILED"] = "GET_DB_SPACE_INFO_FAILED";
})(DatabaseErrorCode || (exports.DatabaseErrorCode = DatabaseErrorCode = {}));


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getStoragePath = getStoragePath;
exports.resolveUserFilePath = resolveUserFilePath;
const tslib_1 = __webpack_require__(3);
const path = tslib_1.__importStar(__webpack_require__(28));
/**
 * Determines the appropriate storage path based on the execution environment.
 * If running as a `pkg` executable, it uses the executable's directory.
 * Otherwise (development mode), it uses the project's root directory.
 *
 * 실행 환경에 따라 적절한 저장소 경로를 결정합니다.
 * `pkg` 실행 파일로 실행 중인 경우, 실행 파일의 디렉토리를 사용합니다.
 * 그렇지 않은 경우(개발 모드), 프로젝트의 루트 디렉토리를 사용합니다.
 *
 * @returns The absolute path to the storage directory.
 * @category Utilities
 * @since 1.0.0
 */
function getStoragePath() {
    const isPkg = !!process.pkg;
    if (isPkg) {
        const executableDir = path.dirname(process.execPath);
        return path.join(executableDir, 'storage');
    }
    else {
        return path.resolve(__dirname, '..', '..', 'storage');
    }
}
/**
 * Resolves the absolute path for a user-specific file within the storage directory.
 *
 * 저장소 디렉토리 내의 사용자 특정 파일에 대한 절대 경로를 확인합니다.
 *
 * @param filename - The name of the user's file.
 * @returns The absolute path to the user's file.
 * @category Utilities
 * @since 1.0.0
 */
function resolveUserFilePath(filename) {
    const storageDir = getStoragePath();
    return path.join(storageDir, filename);
}


/***/ }),
/* 28 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 29 */
/***/ ((module) => {

module.exports = require("fs/promises");

/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LockService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const fs = tslib_1.__importStar(__webpack_require__(29));
const path = tslib_1.__importStar(__webpack_require__(28));
const lockfile = tslib_1.__importStar(__webpack_require__(31));
const _common_1 = __webpack_require__(32);
let LockService = class LockService {
    constructor() {
        this.storageDir = path.join(process.cwd(), 'storage');
    }
    /**
     * Resolves the absolute path for a given filename within the storage directory.
     * 저장소 디렉토리 내에서 주어진 파일 이름에 대한 절대 경로를 확인합니다.
     *
     * @param filename - The name of the file.
     * @returns The absolute path to the file.
     */
    resolvePath(filename) {
        return path.join(this.storageDir, filename);
    }
    /**
     * Acquires an internal file lock for a given filename.
     * 주어진 파일 이름에 대한 내부 파일 잠금을 획득합니다.
     *
     * @param filename - The name of the file to lock.
     * @returns A Promise that resolves with a FileLock object.
     * @throws LockError if the lock cannot be acquired.
     */
    async acquireInternal(filename) {
        const filePath = this.resolvePath(filename);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        try {
            const release = await lockfile.lock(filePath, {
                stale: 30_000,
                realpath: false,
                retries: {
                    retries: 50, // 재시도 횟수 증가
                    factor: 1.2, // 재시도 간격 증가율 감소
                    minTimeout: 50, // 최소 대기 시간 감소
                    maxTimeout: 2000, // 최대 대기 시간 증가
                },
            });
            return { filePath, release };
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Acquires a file lock for a given filename.
     * 주어진 파일 이름에 대한 파일 잠금을 획득합니다.
     *
     * @param filename - The name of the file to lock.
     * @returns A Promise that resolves with a FileLock object.
     * @throws LockError if the lock cannot be acquired.
     */
    async acquire(filename) {
        return this.acquireInternal(filename);
    }
    /**
     * Releases a previously acquired file lock.
     * 이전에 획득한 파일 잠금을 해제합니다.
     *
     * @param lock - The FileLock object to release.
     * @returns A Promise that resolves when the lock is released.
     * @throws LockError if the lock cannot be released.
     */
    async release(lock) {
        await lock.release();
    }
    /**
     * Executes a work function while holding a file lock.
     * 파일 잠금을 유지하면서 작업 함수를 실행합니다.
     *
     * The lock is automatically acquired before the work and released afterwards.
     * If the work function throws an error, the lock is still released, and the original
     * error is re-thrown, potentially augmented with lock release failure information.
     *
     * 작업 전에 잠금이 자동으로 획득되고 작업 후에 해제됩니다.
     * 작업 함수가 오류를 발생시키더라도 잠금은 해제되며,
     * 원래 오류는 잠금 해제 실패 정보와 함께 다시 throw될 수 있습니다.
     *
     * @param filename - The name of the file to lock.
     * @param work - The asynchronous function to execute while holding the lock.
     * @returns A Promise that resolves with the result of the work function.
     * @throws Any error thrown by the work function or a LockError if lock operations fail.
     */
    async withLock(filename, work) {
        const lock = await this.acquire(filename);
        let workerError = null;
        let result = undefined;
        try {
            common_1.Logger.log("with lock work");
            result = await work();
            return result;
        }
        catch (error) {
            common_1.Logger.log('with lock error');
            workerError = error;
        }
        finally {
            try {
                await this.release(lock);
            }
            catch (releaseError) {
                common_1.Logger.warn(`Lock release failed for ${filename}: ${releaseError.message}`, releaseError.stack);
            }
            if (workerError) {
                throw workerError;
            }
        }
        return result;
    }
};
exports.LockService = LockService;
tslib_1.__decorate([
    (0, _common_1.HandleLockFsErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_a = typeof Promise !== "undefined" && Promise) === "function" ? _a : Object)
], LockService.prototype, "acquireInternal", null);
tslib_1.__decorate([
    (0, _common_1.HandleLockFsErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], LockService.prototype, "acquire", null);
tslib_1.__decorate([
    (0, _common_1.HandleLockFsErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], LockService.prototype, "release", null);
exports.LockService = LockService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], LockService);


/***/ }),
/* 31 */
/***/ ((module) => {

module.exports = require("proper-lockfile");

/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggingInterceptor = exports.SuccessResponseInterceptor = exports.HandleCmsConfigErrors = exports.HandleBrokerErrors = exports.HandleResourceMonitoringErrors = exports.HandleDatabaseErrors = exports.checkCmsStatusError = exports.HandleCmsStatusErrors = exports.HandleCmsHttpsClientErrors = exports.checkCmsTokenError = exports.HandleCmsTokenErrors = exports.HandleUserRepoErrors = exports.HandleStorageFsErrors = exports.HandleLockFsErrors = exports.HandleHostErrors = exports.HandleUserErrors = exports.HandleAuthErrors = exports.Public = void 0;
// Export decorators
var public_decorator_1 = __webpack_require__(33);
Object.defineProperty(exports, "Public", ({ enumerable: true, get: function () { return public_decorator_1.Public; } }));
var handle_auth_errors_decorator_1 = __webpack_require__(34);
Object.defineProperty(exports, "HandleAuthErrors", ({ enumerable: true, get: function () { return handle_auth_errors_decorator_1.HandleAuthErrors; } }));
var handle_user_errors_decorator_1 = __webpack_require__(35);
Object.defineProperty(exports, "HandleUserErrors", ({ enumerable: true, get: function () { return handle_user_errors_decorator_1.HandleUserErrors; } }));
var handle_host_errors_decorator_1 = __webpack_require__(51);
Object.defineProperty(exports, "HandleHostErrors", ({ enumerable: true, get: function () { return handle_host_errors_decorator_1.HandleHostErrors; } }));
var handle_lock_fs_errors_decorator_1 = __webpack_require__(52);
Object.defineProperty(exports, "HandleLockFsErrors", ({ enumerable: true, get: function () { return handle_lock_fs_errors_decorator_1.HandleLockFsErrors; } }));
var handle_storage_fs_errors_decorator_1 = __webpack_require__(53);
Object.defineProperty(exports, "HandleStorageFsErrors", ({ enumerable: true, get: function () { return handle_storage_fs_errors_decorator_1.HandleStorageFsErrors; } }));
var handle_user_repo_errors_decorator_1 = __webpack_require__(54);
Object.defineProperty(exports, "HandleUserRepoErrors", ({ enumerable: true, get: function () { return handle_user_repo_errors_decorator_1.HandleUserRepoErrors; } }));
var handle_cms_token_errors_decorator_1 = __webpack_require__(55);
Object.defineProperty(exports, "HandleCmsTokenErrors", ({ enumerable: true, get: function () { return handle_cms_token_errors_decorator_1.HandleCmsTokenErrors; } }));
Object.defineProperty(exports, "checkCmsTokenError", ({ enumerable: true, get: function () { return handle_cms_token_errors_decorator_1.checkCmsTokenError; } }));
var handle_cms_https_client_errors_decorator_1 = __webpack_require__(56);
Object.defineProperty(exports, "HandleCmsHttpsClientErrors", ({ enumerable: true, get: function () { return handle_cms_https_client_errors_decorator_1.HandleCmsHttpsClientErrors; } }));
var handle_cms_status_errors_decorator_1 = __webpack_require__(57);
Object.defineProperty(exports, "HandleCmsStatusErrors", ({ enumerable: true, get: function () { return handle_cms_status_errors_decorator_1.HandleCmsStatusErrors; } }));
Object.defineProperty(exports, "checkCmsStatusError", ({ enumerable: true, get: function () { return handle_cms_status_errors_decorator_1.checkCmsStatusError; } }));
var handle_database_errors_decorator_1 = __webpack_require__(58);
Object.defineProperty(exports, "HandleDatabaseErrors", ({ enumerable: true, get: function () { return handle_database_errors_decorator_1.HandleDatabaseErrors; } }));
var handle_resource_monitoring_errors_decorator_1 = __webpack_require__(59);
Object.defineProperty(exports, "HandleResourceMonitoringErrors", ({ enumerable: true, get: function () { return handle_resource_monitoring_errors_decorator_1.HandleResourceMonitoringErrors; } }));
var handle_broker_errors_decorator_1 = __webpack_require__(60);
Object.defineProperty(exports, "HandleBrokerErrors", ({ enumerable: true, get: function () { return handle_broker_errors_decorator_1.HandleBrokerErrors; } }));
var handle_cms_config_errors_decorator_1 = __webpack_require__(61);
Object.defineProperty(exports, "HandleCmsConfigErrors", ({ enumerable: true, get: function () { return handle_cms_config_errors_decorator_1.HandleCmsConfigErrors; } }));
// Export interceptors
var success_response_interceptor_1 = __webpack_require__(62);
Object.defineProperty(exports, "SuccessResponseInterceptor", ({ enumerable: true, get: function () { return success_response_interceptor_1.SuccessResponseInterceptor; } }));
var logging_interceptor_1 = __webpack_require__(64);
Object.defineProperty(exports, "LoggingInterceptor", ({ enumerable: true, get: function () { return logging_interceptor_1.LoggingInterceptor; } }));


/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Public = void 0;
const common_1 = __webpack_require__(6);
/**
 * A decorator that marks a controller method or class as publicly accessible.
 * 컨트롤러 메서드나 클래스를 공개적으로 접근 가능하도록 표시하는 데코레이터입니다.
 *
 * When applied, the method/class will bypass JWT authentication requirements.
 * This decorator is used to mark endpoints that should be accessible without
 * authentication, such as login, registration, or public API endpoints.
 *
 * 적용되면 메서드/클래스가 JWT 인증 요구사항을 우회합니다.
 * 이 데코레이터는 로그인, 등록 또는 공개 API 엔드포인트와 같이
 * 인증 없이 접근 가능해야 하는 엔드포인트를 표시하는 데 사용됩니다.
 *
 * @category Decorators
 * @since 1.0.0
 * @example
 * ```typescript
 * @Controller('auth')
 * export class AuthController {
 *   @Public()
 *   @Post('login')
 *   async login(@Body() credentials: LoginDto) {
 *     // This endpoint is publicly accessible
 *     // 이 엔드포인트는 공개적으로 접근 가능합니다
 *   }
 * }
 * ```
 */
const Public = () => (0, common_1.SetMetadata)('isPublic', true);
exports.Public = Public;


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandleAuthErrors = HandleAuthErrors;
/**
 * A method decorator that wraps authentication methods in a try...catch block.
 * 인증 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * 에러를 변환하지 않고 그대로 전달합니다. 시스템/라이브러리 레벨 에러는
 * 하위 데코레이터에서 이미 AppError로 변환되었으므로 그대로 전달합니다.
 *
 * Errors are passed through as-is. System/library level errors are already
 * converted to AppError by lower-level decorators.
 *
 * @category Decorators
 * @since 1.0.0
 */
function HandleAuthErrors() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            try {
                return await originalMethod.apply(this, args);
            }
            catch (err) {
                throw err;
            }
        };
    };
}


/***/ }),
/* 35 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandleUserErrors = HandleUserErrors;
const _error_1 = __webpack_require__(36);
/**
 * A method decorator that wraps user service methods in a try...catch block.
 * 사용자 서비스 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * 시스템/라이브러리 레벨 에러(StorageError, LockError)만 UserError로 변환하고,
 * 이미 AppError로 변환된 에러는 그대로 전달합니다.
 *
 * Only converts system/library level errors (StorageError, LockError) to UserError.
 * Already converted AppError instances are passed through as-is.
 *
 * @category Decorators
 * @since 1.0.0
 */
function HandleUserErrors() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            try {
                return await originalMethod.apply(this, args);
            }
            catch (err) {
                if (err instanceof _error_1.UserError) {
                    throw err;
                }
                if (err instanceof _error_1.AppError) {
                    throw err;
                }
                if (err instanceof _error_1.LockError) {
                    throw _error_1.UserError.LockOperationFailed({}, err);
                }
                else if (err instanceof _error_1.StorageError) {
                    switch (err.code) {
                        case _error_1.StorageErrorCode.NO_SUCH_FILE:
                        case _error_1.StorageErrorCode.FILE_NOT_FOUND: // Deprecated
                            throw _error_1.UserError.UserNotFound(err.additionalData || {}, err);
                        case _error_1.StorageErrorCode.FILE_ALREADY_EXISTS:
                        case _error_1.StorageErrorCode.PERMISSION_DENIED:
                        case _error_1.StorageErrorCode.UNKNOWN:
                            throw _error_1.UserError.Unknown({}, err);
                        default:
                            throw _error_1.UserError.Unknown({}, err);
                    }
                }
                else {
                    throw _error_1.UserError.Unknown({}, err);
                }
            }
        };
    };
}


/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(3);
// Base error class
tslib_1.__exportStar(__webpack_require__(20), exports);
// Domain-specific errors
tslib_1.__exportStar(__webpack_require__(37), exports);
tslib_1.__exportStar(__webpack_require__(38), exports);
tslib_1.__exportStar(__webpack_require__(19), exports);
tslib_1.__exportStar(__webpack_require__(39), exports);
tslib_1.__exportStar(__webpack_require__(40), exports);
tslib_1.__exportStar(__webpack_require__(41), exports);
tslib_1.__exportStar(__webpack_require__(42), exports);
tslib_1.__exportStar(__webpack_require__(44), exports);
tslib_1.__exportStar(__webpack_require__(45), exports);
tslib_1.__exportStar(__webpack_require__(46), exports);
tslib_1.__exportStar(__webpack_require__(48), exports);
tslib_1.__exportStar(__webpack_require__(49), exports);
// Global error handling
tslib_1.__exportStar(__webpack_require__(50), exports);


/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HostError = exports.HostErrorCode = void 0;
const app_error_1 = __webpack_require__(20);
const host_error_code_1 = __webpack_require__(24);
Object.defineProperty(exports, "HostErrorCode", ({ enumerable: true, get: function () { return host_error_code_1.HostErrorCode; } }));
/**
 * Error class for host-related operations.
 * 호스트 관련 작업을 위한 오류 클래스입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
class HostError extends app_error_1.AppError {
    constructor(kind, code, additionalData, originalError) {
        super(kind, code, additionalData, originalError);
    }
    /**
     * Creates an error indicating that the maximum number of hosts has been exceeded.
     *
     * 최대 호스트 수를 초과했음을 나타내는 오류를 생성합니다.
     */
    static ExceedMaxHosts(additionalData, originalError) {
        return new HostError('RESOURCE', host_error_code_1.HostErrorCode.EXCEED_MAX_HOSTS, additionalData, originalError);
    }
    /**
     * Creates an error indicating an invalid format for host information.
     *
     * 호스트 정보의 형식이 유효하지 않음을 나타내는 오류를 생성합니다.
     */
    static InvalidFormat(additionalData, originalError) {
        return new HostError('RESOURCE', host_error_code_1.HostErrorCode.INVALID_FORMAT, additionalData, originalError);
    }
    /**
     * Creates an error indicating a duplicate host entry.
     *
     * 중복된 호스트 항목을 나타내는 오류를 생성합니다.
     */
    static DuplicatedHost(additionalData, originalError) {
        return new HostError('RESOURCE', host_error_code_1.HostErrorCode.DUPLICATED_HOST, additionalData, originalError);
    }
    /**
     * Creates an error indicating that no such host was found.
     *
     * 해당 호스트를 찾을 수 없음을 나타내는 오류를 생성합니다.
     */
    static NoSuchHost(additionalData, originalError) {
        return new HostError('RESOURCE', host_error_code_1.HostErrorCode.NO_SUCH_HOST, additionalData, originalError);
    }
    /**
     * Creates an error indicating an internal host-related server error.
     *
     * 내부 호스트 관련 서버 오류를 나타내는 오류를 생성합니다.
     */
    static InternalError(additionalData, originalError) {
        return new HostError('RESOURCE', host_error_code_1.HostErrorCode.INTERNAL_ERROR, additionalData, originalError);
    }
}
exports.HostError = HostError;


/***/ }),
/* 38 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RepositoryError = exports.RepositoryErrorCode = void 0;
const app_error_1 = __webpack_require__(20);
/**
 * Enumeration of repository-related error codes.
 *
 * 리포지토리 관련 오류 코드 열거형입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
var RepositoryErrorCode;
(function (RepositoryErrorCode) {
    RepositoryErrorCode["USER_NOT_FOUND"] = "USER_NOT_FOUND";
    RepositoryErrorCode["USER_ALREADY_EXISTS"] = "USER_ALREADY_EXISTS";
})(RepositoryErrorCode || (exports.RepositoryErrorCode = RepositoryErrorCode = {}));
/**
 * Error class for repository-related operations.
 * 리포지토리 관련 작업을 위한 오류 클래스입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
class RepositoryError extends app_error_1.AppError {
    constructor(kind, code, additionalData, originalError) {
        super(kind, code, additionalData, originalError);
    }
    /**
     * Creates an error indicating that a user was not found in the repository.
     *
     * 리포지토리에서 사용자를 찾을 수 없음을 나타내는 오류를 생성합니다.
     */
    static UserNotFound(additionalData, originalError) {
        return new RepositoryError('RESOURCE', RepositoryErrorCode.USER_NOT_FOUND, additionalData, originalError);
    }
    /**
     * Creates an error indicating that a user with the given ID already exists in the repository.
     *
     * 주어진 ID를 가진 사용자가 리포지토리에 이미 존재함을 나타내는 오류를 생성합니다.
     */
    static UserAlreadyExists(additionalData, originalError) {
        return new RepositoryError('RESOURCE', RepositoryErrorCode.USER_ALREADY_EXISTS, additionalData, originalError);
    }
}
exports.RepositoryError = RepositoryError;


/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LockError = exports.LockErrorCode = void 0;
const app_error_1 = __webpack_require__(20);
const lock_error_code_1 = __webpack_require__(23);
Object.defineProperty(exports, "LockErrorCode", ({ enumerable: true, get: function () { return lock_error_code_1.LockErrorCode; } }));
/**
 * Error class for lock-related operations.
 * 잠금 관련 작업을 위한 오류 클래스입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
class LockError extends app_error_1.AppError {
    constructor(kind, code, additionalData, originalError) {
        super(kind, code, additionalData, originalError);
    }
    /**
     * Creates an error indicating that a lock was not found.
     *
     * 잠금을 찾을 수 없음을 나타내는 오류를 생성합니다.
     */
    static LockNotFound(additionalData, originalError) {
        return new LockError('LOCK', lock_error_code_1.LockErrorCode.LOCK_NOT_FOUND, additionalData, originalError);
    }
    /**
     * Creates an error indicating that permission was denied for a lock operation.
     *
     * 잠금 작업에 대한 권한이 거부되었음을 나타내는 오류를 생성합니다.
     */
    static PermissionDenied(additionalData, originalError) {
        return new LockError('LOCK', lock_error_code_1.LockErrorCode.PERMISSION_DENIED, additionalData, originalError);
    }
    /**
     * Creates an error indicating that a lock is already held.
     *
     * 잠금이 이미 유지되고 있음을 나타내는 오류를 생성합니다.
     */
    static LockAlreadyHeld(additionalData, originalError) {
        return new LockError('LOCK', lock_error_code_1.LockErrorCode.LOCK_ALREADY_HELD, additionalData, originalError);
    }
    /**
     * Creates an error indicating that a lock is stale (e.g., expired).
     *
     * 잠금이 오래되었음(예: 만료됨)을 나타내는 오류를 생성합니다.
     */
    static StaleLock(additionalData, originalError) {
        return new LockError('LOCK', lock_error_code_1.LockErrorCode.STALE_LOCK, additionalData, originalError);
    }
    /**
     * Creates an error for an unknown lock-related issue.
     *
     * 알 수 없는 잠금 관련 문제를 나타내는 오류를 생성합니다.
     */
    static Unknown(additionalData, originalError) {
        return new LockError('LOCK', lock_error_code_1.LockErrorCode.UNKNOWN, additionalData, originalError);
    }
}
exports.LockError = LockError;


/***/ }),
/* 40 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserError = exports.UserErrorCode = void 0;
const app_error_1 = __webpack_require__(20);
const user_error_code_1 = __webpack_require__(25);
Object.defineProperty(exports, "UserErrorCode", ({ enumerable: true, get: function () { return user_error_code_1.UserErrorCode; } }));
/**
 * Error class for user-related operations.
 * 사용자 관련 작업을 위한 오류 클래스입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
class UserError extends app_error_1.AppError {
    constructor(kind, code, additionalData, originalError) {
        super(kind, code, additionalData, originalError);
    }
    /**
     * Creates an error indicating that a user was not found.
     *
     * 사용자를 찾을 수 없음을 나타내는 오류를 생성합니다.
     */
    static UserNotFound(additionalData, originalError) {
        return new UserError('USER', user_error_code_1.UserErrorCode.USER_NOT_FOUND, additionalData, originalError);
    }
    /**
     * Creates an error indicating that a user with the given ID already exists.
     *
     * 주어진 ID를 가진 사용자가 이미 존재함을 나타내는 오류를 생성합니다.
     */
    static UserAlreadyExists(additionalData, originalError) {
        return new UserError('USER', user_error_code_1.UserErrorCode.USER_ALREADY_EXISTS, additionalData, originalError);
    }
    /**
     * Creates an error indicating that user data failed to save.
     *
     * 사용자 데이터 저장에 실패했음을 나타내는 오류를 생성합니다.
     */
    static DataSaveFailed(additionalData, originalError) {
        return new UserError('USER', user_error_code_1.UserErrorCode.DATA_SAVE_FAILED, additionalData, originalError);
    }
    /**
     * Creates an error indicating that user data failed to load.
     *
     * 사용자 데이터 로드에 실패했음을 나타내는 오류를 생성합니다.
     */
    static DataLoadFailed(additionalData, originalError) {
        return new UserError('USER', user_error_code_1.UserErrorCode.DATA_LOAD_FAILED, additionalData, originalError);
    }
    /**
     * Creates an error indicating that user data failed to delete.
     *
     * 사용자 데이터 삭제에 실패했음을 나타내는 오류를 생성합니다.
     */
    static DataDeleteFailed(additionalData, originalError) {
        return new UserError('USER', user_error_code_1.UserErrorCode.DATA_DELETE_FAILED, additionalData, originalError);
    }
    /**
     * Creates an error indicating that user data failed to update.
     *
     * 사용자 데이터 업데이트에 실패했음을 나타내는 오류를 생성합니다.
     */
    static DataUpdateFailed(additionalData, originalError) {
        return new UserError('USER', user_error_code_1.UserErrorCode.DATA_UPDATE_FAILED, additionalData, originalError);
    }
    /**
     * Creates an error indicating that a user resource is locked.
     *
     * 사용자 리소스가 잠겨 있음을 나타내는 오류를 생성합니다.
     */
    static ResourceLocked(additionalData, originalError) {
        return new UserError('USER', user_error_code_1.UserErrorCode.RESOURCE_LOCKED, additionalData, originalError);
    }
    /**
     * Creates an error indicating that a lock operation on a user resource failed.
     *
     * 사용자 리소스에 대한 잠금 작업이 실패했음을 나타내는 오류를 생성합니다.
     */
    static LockOperationFailed(additionalData, originalError) {
        return new UserError('USER', user_error_code_1.UserErrorCode.LOCK_OPERATION_FAILED, additionalData, originalError);
    }
    /**
     * Creates an error indicating that the old password provided does not match.
     *
     * 제공된 이전 비밀번호가 일치하지 않음을 나타내는 오류를 생성합니다.
     */
    static OldPasswordMismatch(additionalData, originalError) {
        return new UserError('USER', user_error_code_1.UserErrorCode.OLD_PASSWORD_MISMATCH, additionalData, originalError);
    }
    /**
     * Creates an error indicating that the new password provided is invalid.
     *
     * 제공된 새 비밀번호가 유효하지 않음을 나타내는 오류를 생성합니다.
     */
    static BadNewPassword(additionalData, originalError) {
        return new UserError('USER', user_error_code_1.UserErrorCode.BAD_NEW_PASSWORD, additionalData, originalError);
    }
    /**
     * Creates an error for an unknown user-related issue.
     *
     * 알 수 없는 사용자 관련 문제를 나타내는 오류를 생성합니다.
     */
    static Unknown(additionalData, originalError) {
        return new UserError('USER', user_error_code_1.UserErrorCode.UNKNOWN, additionalData, originalError);
    }
}
exports.UserError = UserError;


/***/ }),
/* 41 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseError = void 0;
const app_error_1 = __webpack_require__(20);
const database_error_code_1 = __webpack_require__(26);
/**
 * Error class for database-related operations.
 *
 * 데이터베이스 관련 작업을 위한 에러 클래스입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
class DatabaseError extends app_error_1.AppError {
    constructor(kind, code, additionalData, originalError) {
        super(kind, code, additionalData, originalError);
    }
    /**
     * Creates an error indicating that the specified database does not exist.
     *
     * 지정한 데이터베이스가 존재하지 않음을 나타내는 오류를 생성합니다.
     */
    static NoSuchDatabase(additionalData, originalError) {
        return new DatabaseError('DATABASE', database_error_code_1.DatabaseErrorCode.NO_SUCH_DATABASE, additionalData, originalError);
    }
    /**
     * Creates an error indicating that getting start info failed.
     *
     * 시작 정보 조회 실패를 나타내는 오류를 생성합니다.
     */
    static GetStartInfoFailed(additionalData, originalError) {
        return new DatabaseError('DATABASE', database_error_code_1.DatabaseErrorCode.GET_START_INFO_FAILED, additionalData, originalError);
    }
    /**
     * Creates an error indicating that starting database failed.
     *
     * 데이터베이스 시작 실패를 나타내는 오류를 생성합니다.
     */
    static StartDatabaseFailed(additionalData, originalError) {
        return new DatabaseError('DATABASE', database_error_code_1.DatabaseErrorCode.START_DATABASE_FAILED, additionalData, originalError);
    }
    /**
     * Creates an error indicating that stopping database failed.
     *
     * 데이터베이스 중지 실패를 나타내는 오류를 생성합니다.
     */
    static StopDatabaseFailed(additionalData, originalError) {
        return new DatabaseError('DATABASE', database_error_code_1.DatabaseErrorCode.STOP_DATABASE_FAILED, additionalData, originalError);
    }
    /**
     * Creates an error indicating that restarting database failed.
     *
     * 데이터베이스 재시작 실패를 나타내는 오류를 생성합니다.
     */
    static RestartDatabaseFailed(additionalData, originalError) {
        return new DatabaseError('DATABASE', database_error_code_1.DatabaseErrorCode.RESTART_DATABASE_FAILED, additionalData, originalError);
    }
    /**
     * Creates an error indicating that database login failed.
     *
     * 데이터베이스 로그인 실패를 나타내는 오류를 생성합니다.
     */
    static LoginDatabaseFailed(additionalData, originalError) {
        return new DatabaseError('DATABASE', database_error_code_1.DatabaseErrorCode.LOGIN_DATABASE_FAILED, additionalData, originalError);
    }
    /**
     * Creates an error indicating that getting database space info failed.
     *
     * 데이터베이스 공간 정보 조회 실패를 나타내는 오류를 생성합니다.
     */
    static GetDBSpaceInfoFailed(additionalData, originalError) {
        return new DatabaseError('DATABASE', database_error_code_1.DatabaseErrorCode.GET_DB_SPACE_INFO_FAILED, additionalData, originalError);
    }
    /**
     * Creates an error indicating an internal database-related server error.
     *
     * 내부 데이터베이스 관련 서버 오류를 나타내는 오류를 생성합니다.
     */
    static InternalError(additionalData, originalError) {
        return new DatabaseError('DATABASE', database_error_code_1.DatabaseErrorCode.INTERNAL_ERROR, additionalData, originalError);
    }
    /**
     * Creates an error indicating a duplicated database profile.
     *
     * 중복된 데이터베이스 프로파일을 나타내는 오류를 생성합니다.
     */
    static DuplicatedDatabaseProfile(additionalData, originalError) {
        return new DatabaseError('DATABASE', database_error_code_1.DatabaseErrorCode.DUPLICATED_DATABASE_PROFILE, additionalData, originalError);
    }
}
exports.DatabaseError = DatabaseError;


/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BrokerError = void 0;
const app_error_1 = __webpack_require__(20);
const broker_error_code_1 = __webpack_require__(43);
class BrokerError extends app_error_1.AppError {
    constructor(kind, code, additionalData, originalError) {
        super(kind, code, additionalData, originalError);
    }
    static GetBrokersFailed(additionalData, originalError) {
        return new BrokerError('CMS', broker_error_code_1.BrokerErrorCode.GET_BROKER_FAILED, additionalData, originalError);
    }
    static BrokerStopFailed(additionalData, originalError) {
        return new BrokerError('CMS', broker_error_code_1.BrokerErrorCode.BROKER_STOP_FAILED, additionalData, originalError);
    }
    static BrokerStartFailed(additionalData, originalError) {
        return new BrokerError('CMS', broker_error_code_1.BrokerErrorCode.BROKER_START_FAILED, additionalData, originalError);
    }
}
exports.BrokerError = BrokerError;


/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BrokerErrorCode = void 0;
var BrokerErrorCode;
(function (BrokerErrorCode) {
    BrokerErrorCode["GET_BROKER_FAILED"] = "GET_BROKER_FAILED";
    BrokerErrorCode["BROKER_STOP_FAILED"] = "BROKER_STOP_FAILED";
    BrokerErrorCode["BROKER_START_FAILED"] = "BROKER_START_FAILED";
})(BrokerErrorCode || (exports.BrokerErrorCode = BrokerErrorCode = {}));


/***/ }),
/* 44 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthError = exports.AuthErrorCode = void 0;
const app_error_1 = __webpack_require__(20);
const auth_error_code_1 = __webpack_require__(21);
Object.defineProperty(exports, "AuthErrorCode", ({ enumerable: true, get: function () { return auth_error_code_1.AuthErrorCode; } }));
/**
 * Represents an authentication-specific error.
 * Extends AppError and provides static factory methods for common authentication error scenarios.
 *
 * 인증 관련 오류를 나타냅니다.
 * AppError를 확장하며 일반적인 인증 오류 시나리오에 대한 정적 팩토리 메서드를 제공합니다.
 *
 * @category Errors
 * @since 1.0.0
 */
class AuthError extends app_error_1.AppError {
    constructor(kind, code, additionalData, originalError) {
        super(kind, code, additionalData, originalError);
    }
    /**
     * Creates an error indicating invalid authentication credentials.
     *
     * 유효하지 않은 인증 자격 증명을 나타내는 오류를 생성합니다.
     */
    static InvalidCredentials(additionalData, originalError) {
        return new AuthError('AUTH', auth_error_code_1.AuthErrorCode.INVALID_CREDENTIALS, additionalData, originalError);
    }
    /**
     * Creates an error indicating an internal authentication server error.
     *
     * 내부 인증 서버 오류를 나타내는 오류를 생성합니다.
     */
    static InternalError(additionalData, originalError) {
        return new AuthError('INTERNAL', auth_error_code_1.AuthErrorCode.INTERNAL_ERROR, additionalData, originalError);
    }
    /**
     * Creates an error indicating that the user does not have permission to access a resource.
     *
     * 사용자가 리소스에 접근할 권한이 없음을 나타내는 오류를 생성합니다.
     */
    static PermissionDenied(additionalData, originalError) {
        return new AuthError('AUTH', auth_error_code_1.AuthErrorCode.PERMISSION_DENIED, additionalData, originalError);
    }
    /**
     * Creates an error indicating an invalid or expired authentication token.
     *
     * 유효하지 않거나 만료된 인증 토큰을 나타내는 오류를 생성합니다.
     */
    static InvalidToken(additionalData, originalError) {
        return new AuthError('AUTH', auth_error_code_1.AuthErrorCode.INVALID_TOKEN, additionalData, originalError);
    }
    /**
     * Creates an error for an unknown authentication issue.
     *
     * 알 수 없는 인증 문제를 나타내는 오류를 생성합니다.
     */
    static Unknown(additionalData, originalError) {
        return new AuthError('AUTH', auth_error_code_1.AuthErrorCode.UNKNOWN, additionalData, originalError);
    }
}
exports.AuthError = AuthError;


/***/ }),
/* 45 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CmsError = exports.CmsErrorCode = void 0;
const app_error_1 = __webpack_require__(20);
/**
 * Enumeration of CMS error codes.
 *
 * CMS 오류 코드 열거형입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
var CmsErrorCode;
(function (CmsErrorCode) {
    CmsErrorCode["REQUEST_FAILED"] = "REQUEST_FAILED";
    CmsErrorCode["NO_RESPONSE"] = "NO_RESPONSE";
    CmsErrorCode["INVALID_TOKEN"] = "INVALID_TOKEN";
    CmsErrorCode["UNKNOWN"] = "UNKNOWN";
})(CmsErrorCode || (exports.CmsErrorCode = CmsErrorCode = {}));
/**
 * Represents a CMS-specific error.
 * Extends AppError and provides static factory methods for common CMS error scenarios.
 *
 * CMS 관련 오류를 나타냅니다.
 * AppError를 확장하며 일반적인 CMS 오류 시나리오에 대한 정적 팩토리 메서드를 제공합니다.
 *
 * @category Errors
 * @since 1.0.0
 */
class CmsError extends app_error_1.AppError {
    constructor(kind, code, additionalData, originalError) {
        super(kind, code, additionalData, originalError);
    }
    /**
     * Creates an error indicating that the request to the CMS API failed.
     *
     * CMS API로의 요청이 실패했음을 나타내는 오류를 생성합니다.
     */
    static RequestFailed(additionalData, originalError) {
        return new CmsError('CMS', CmsErrorCode.REQUEST_FAILED, additionalData, originalError);
    }
    /**
     * Creates an error indicating that no response was received from the CMS API.
     *
     * CMS API로부터 응답을 받지 못했음을 나타내는 오류를 생성합니다.
     */
    static NoResponse(additionalData, originalError) {
        return new CmsError('CMS', CmsErrorCode.NO_RESPONSE, additionalData, originalError);
    }
    /**
     * Creates an error for an unknown CMS issue.
     *
     * 알 수 없는 CMS 문제를 나타내는 오류를 생성합니다.
     */
    static Unknown(additionalData, originalError) {
        return new CmsError('CMS', CmsErrorCode.UNKNOWN, additionalData, originalError);
    }
    /**
     * Creates an error indicating an invalid authentication token for CMS.
     *
     * CMS에 대한 유효하지 않은 인증 토큰을 나타내는 오류를 생성합니다.
     */
    static InvalidToken(additionalData, originalError) {
        return new CmsError('CMS', CmsErrorCode.INVALID_TOKEN, additionalData, originalError);
    }
}
exports.CmsError = CmsError;


/***/ }),
/* 46 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ValidationError = void 0;
const app_error_1 = __webpack_require__(20);
const validation_error_code_1 = __webpack_require__(47);
/**
 * Error class for validation-related operations.
 * Used for request body validation, form validation, etc.
 *
 * 유효성 검사 관련 작업을 위한 에러 클래스입니다.
 * 요청 본문 검증, 폼 검증 등에 사용됩니다.
 */
class ValidationError extends app_error_1.AppError {
    constructor(kind, code, additionalData, originalError) {
        super(kind, code, additionalData, originalError);
    }
    /**
     * Creates a validation error for invalid request body.
     *
     * @param missingFields - Array of missing required field names
     * @param additionalData - Additional error context
     * @returns ValidationError instance
     */
    static InvalidRequestBody(missingFields, additionalData) {
        return new ValidationError('VALIDATION', validation_error_code_1.ValidationErrorCode.INVALID_REQUEST_BODY, {
            missingFields,
            ...additionalData,
        });
    }
    /**
     * Creates a validation error for missing required field(s).
     *
     * @param fieldNames - Array of missing field names
     * @param additionalData - Additional error context
     * @returns ValidationError instance
     */
    static MissingRequiredField(fieldNames, additionalData) {
        const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
        return new ValidationError('VALIDATION', validation_error_code_1.ValidationErrorCode.MISSING_REQUIRED_FIELD, {
            missingFields: fields,
            ...additionalData,
        });
    }
    /**
     * Creates a validation error for missing database credentials.
     * Used when database profile doesn't exist and client must provide credentials.
     *
     * 데이터베이스 자격 증명 누락을 나타내는 유효성 검사 오류를 생성합니다.
     * 데이터베이스 프로파일이 없을 때 클라이언트가 자격 증명을 제공해야 하는 경우에 사용됩니다.
     *
     * @param dbname - Database name
     * @param missingFields - Array of missing credential field names (e.g., ['id', 'password'])
     * @param additionalData - Additional error context
     * @returns ValidationError instance
     */
    static MissingDBCredentials(dbname, missingFields, additionalData) {
        return new ValidationError('VALIDATION', validation_error_code_1.ValidationErrorCode.MISSING_DB_CREDENTIALS, {
            dbname,
            missingFields,
            message: `Database profile not found for dbname: ${dbname}. Client must provide id and password when profile doesn't exist.`,
            ...additionalData,
        });
    }
    /**
     * Creates a validation error for invalid field format.
     *
     * @param fieldName - Field name with invalid format
     * @param expectedFormat - Expected format description
     * @param additionalData - Additional error context
     * @returns ValidationError instance
     */
    static InvalidFieldFormat(fieldName, expectedFormat, additionalData) {
        return new ValidationError('VALIDATION', validation_error_code_1.ValidationErrorCode.INVALID_FIELD_FORMAT, {
            fieldName,
            expectedFormat,
            ...additionalData,
        });
    }
}
exports.ValidationError = ValidationError;


/***/ }),
/* 47 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ValidationErrorCode = void 0;
/**
 * Error codes for validation errors.
 *
 * 유효성 검사 에러 코드입니다.
 */
var ValidationErrorCode;
(function (ValidationErrorCode) {
    ValidationErrorCode["INVALID_REQUEST_BODY"] = "INVALID_REQUEST_BODY";
    ValidationErrorCode["MISSING_REQUIRED_FIELD"] = "MISSING_REQUIRED_FIELD";
    ValidationErrorCode["MISSING_DB_CREDENTIALS"] = "MISSING_DB_CREDENTIALS";
    ValidationErrorCode["INVALID_FIELD_FORMAT"] = "INVALID_FIELD_FORMAT";
})(ValidationErrorCode || (exports.ValidationErrorCode = ValidationErrorCode = {}));


/***/ }),
/* 48 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResourceMonitoringError = void 0;
const app_error_1 = __webpack_require__(20);
const resource_monitoring_error_code_1 = __webpack_require__(49);
/**
 * Custom error class for resource monitoring operations.
 *
 * @category Error
 * @since 1.0.0
 */
class ResourceMonitoringError extends app_error_1.AppError {
    constructor(code, additionalData, originalError) {
        super('RESOURCE', code, additionalData, originalError);
    }
    /**
     * Creates an error for an unknown or unexpected issue.
     */
    static Unknown(additionalData, originalError) {
        return new ResourceMonitoringError(resource_monitoring_error_code_1.ResourceMonitoringErrorCode.UNKNOWN, additionalData, originalError);
    }
    /**
     * Creates an error for when the CMS API call fails.
     */
    static CmsApiFailure(additionalData, originalError) {
        return new ResourceMonitoringError(resource_monitoring_error_code_1.ResourceMonitoringErrorCode.CMS_API_FAILURE, additionalData, originalError);
    }
    /**
     * Creates an error for when the target host is not found.
     */
    static HostNotFound(additionalData, originalError) {
        return new ResourceMonitoringError(resource_monitoring_error_code_1.ResourceMonitoringErrorCode.HOST_NOT_FOUND, additionalData, originalError);
    }
}
exports.ResourceMonitoringError = ResourceMonitoringError;


/***/ }),
/* 49 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResourceMonitoringErrorCode = void 0;
/**
 * Enum for resource monitoring error codes.
 *
 * @category Error
 * @since 1.0.0
 */
var ResourceMonitoringErrorCode;
(function (ResourceMonitoringErrorCode) {
    /**
     * An unknown or unexpected error occurred during resource monitoring.
     */
    ResourceMonitoringErrorCode["UNKNOWN"] = "RESOURCE_MONITORING_UNKNOWN";
    /**
     * Failed to retrieve statistics from the CMS API.
     */
    ResourceMonitoringErrorCode["CMS_API_FAILURE"] = "RESOURCE_MONITORING_CMS_API_FAILURE";
    /**
     * The host to be monitored could not be found.
     */
    ResourceMonitoringErrorCode["HOST_NOT_FOUND"] = "RESOURCE_MONITORING_HOST_NOT_FOUND";
})(ResourceMonitoringErrorCode || (exports.ResourceMonitoringErrorCode = ResourceMonitoringErrorCode = {}));


/***/ }),
/* 50 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GlobalExceptionFilter = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const core_1 = __webpack_require__(1);
const app_error_1 = __webpack_require__(20);
/**
 * Global exception filter for handling all unhandled exceptions across the application.
 * It catches various types of exceptions (HttpException, AppError, and others)
 * and formats the response according to RFC 7807 Problem Details for AppError instances.
 *
 * 애플리케이션 전반의 모든 처리되지 않은 예외를 처리하기 위한 전역 예외 필터입니다.
 * 다양한 유형의 예외(HttpException, AppError 및 기타)를 catch하고
 * AppError 인스턴스의 경우 RFC 7807 문제 세부 정보에 따라 응답 형식을 지정합니다.
 *
 * @category Errors
 * @since 1.0.0
 */
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter extends core_1.BaseExceptionFilter {
    constructor() {
        super(...arguments);
        this.logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();
        let status;
        let note;
        let errorData = null;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                note = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const responseObj = exceptionResponse;
                note = responseObj.message || responseObj.detail || exception.message || 'An error occurred';
                if (responseObj.detail || responseObj.message) {
                    errorData = { message: responseObj.message || responseObj.detail };
                }
            }
            else {
                note = exception.message || 'An error occurred';
            }
            this.logger.error('HttpException', `HTTP Exception: ${exception.message}`, exception.stack, `${req.method} ${req.url}`);
        }
        else if (exception instanceof app_error_1.AppError) {
            const problemDetails = exception.toProblemDetails(req.url);
            status = problemDetails.status;
            note = problemDetails.detail || problemDetails.title || exception.message || 'An error occurred';
            errorData = {
                code: problemDetails.code,
                type: problemDetails.type,
                title: problemDetails.title,
            };
            const logDetails = exception.toLogDetails(req.url);
            this.logger.error('App Error', `App Error [${exception.kind}:${exception.code}]: ${exception.message}`, JSON.stringify(logDetails, null, 2), `${req.method} ${req.url}`);
        }
        else {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            note = exception?.message || 'An unexpected error occurred';
            this.logger.error('Other Errors', `Unknown Error: ${exception?.message || 'No message'}`, exception?.stack || 'No stack trace', `${req.method} ${req.url}`);
        }
        const standardResponse = {
            data: errorData,
            status: status,
            note: note,
        };
        res.status(status).json(standardResponse);
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = tslib_1.__decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);


/***/ }),
/* 51 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandleHostErrors = HandleHostErrors;
const _error_1 = __webpack_require__(36);
/**
 * A method decorator that wraps host service methods in a try...catch block.
 * 호스트 서비스 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * 시스템/라이브러리 레벨 에러(StorageError, LockError)를 의미에 맞는 HostError로 변환하고,
 * 이미 AppError로 변환된 에러는 그대로 전달합니다.
 *
 * Converts system/library level errors (StorageError, LockError) to semantically appropriate HostError.
 * Already converted AppError instances are passed through as-is.
 *
 * @category Decorators
 * @since 1.0.0
 */
function HandleHostErrors() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            try {
                return await originalMethod.apply(this, args);
            }
            catch (err) {
                const contextId = args[0] || 'unknown';
                if (err instanceof _error_1.AppError) {
                    throw err;
                }
                if (err instanceof _error_1.StorageError) {
                    switch (err.code) {
                        case _error_1.StorageErrorCode.NO_SUCH_FILE:
                        case _error_1.StorageErrorCode.FILE_NOT_FOUND:
                            throw _error_1.HostError.NoSuchHost({ userId: contextId, hostUid: err.additionalData?.filePath }, err);
                        case _error_1.StorageErrorCode.FILE_ALREADY_EXISTS:
                            throw _error_1.HostError.DuplicatedHost({ userId: contextId }, err);
                        default:
                            throw _error_1.HostError.InternalError({
                                userId: contextId,
                                originalError: 'StorageError',
                                storageErrorCode: err.code,
                                ...err.additionalData,
                            }, err);
                    }
                }
                if (err instanceof _error_1.LockError) {
                    switch (err.code) {
                        case _error_1.LockErrorCode.LOCK_NOT_FOUND:
                            if (err.message?.includes('ENOENT')) {
                                throw _error_1.HostError.NoSuchHost({ userId: contextId }, err);
                            }
                            throw _error_1.HostError.InternalError({
                                userId: contextId,
                                originalError: 'LockError',
                                lockErrorCode: err.code,
                                ...err.additionalData,
                            }, err);
                        case _error_1.LockErrorCode.LOCK_ALREADY_HELD:
                            throw _error_1.HostError.InternalError({
                                userId: contextId,
                                originalError: 'LockError',
                                lockErrorCode: err.code,
                                ...err.additionalData,
                            }, err);
                        default:
                            throw _error_1.HostError.InternalError({
                                userId: contextId,
                                originalError: 'LockError',
                                lockErrorCode: err.code,
                                ...err.additionalData,
                            }, err);
                    }
                }
                throw _error_1.HostError.InternalError({ userId: contextId }, err);
            }
        };
    };
}


/***/ }),
/* 52 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandleLockFsErrors = HandleLockFsErrors;
const lock_error_1 = __webpack_require__(39);
const _error_1 = __webpack_require__(36);
/**
 * A method decorator that wraps lock service methods in a try...catch block.
 * 락 서비스 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * It provides centralized handling for file system errors related to lock operations,
 * translating them into appropriate LockError instances.
 *
 * 락 작업과 관련된 파일 시스템 오류에 대한 중앙 집중식 처리를 제공하여
 * 적절한 LockError 인스턴스로 변환합니다.
 *
 * This decorator handles various lock-related file system errors including:
 * - ENOENT: Lock file not found
 * - EACCES/EPERM: Permission denied
 * - EEXIST/ELOCKED: Lock already held
 * - ENOTACQUIRED: Lock not acquired
 * - ECOMPROMISED: Lock compromised
 * - ERELEASED: Lock already released
 *
 * 이 데코레이터는 다음을 포함한 다양한 락 관련 파일 시스템 오류를 처리합니다:
 * - ENOENT: 락 파일을 찾을 수 없음
 * - EACCES/EPERM: 권한 거부
 * - EEXIST/ELOCKED: 락이 이미 보유됨
 * - ENOTACQUIRED: 락을 획득하지 못함
 * - ECOMPROMISED: 락이 손상됨
 * - ERELEASED: 락이 이미 해제됨
 *
 * @category Decorators
 * @since 1.0.0
 * @example
 * ```typescript
 * class LockService {
 *   @HandleLockFsErrors()
 *   async acquireLock(filePath: string): Promise<void> {
 *     // Lock acquisition logic
 *     // 락 획득 로직
 *   }
 * }
 * ```
 */
function HandleLockFsErrors() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            try {
                return await originalMethod.apply(this, args);
            }
            catch (err) {
                if (err instanceof _error_1.AppError) {
                    throw err;
                }
                switch (err?.code) {
                    case 'ENOENT':
                        throw lock_error_1.LockError.LockNotFound({ filePath: err.path }, err);
                    case 'EACCES':
                    case 'EPERM':
                        throw lock_error_1.LockError.PermissionDenied({ filePath: err.path }, err);
                    case 'EEXIST':
                    case 'ELOCKED': // proper-lockfile code
                        throw lock_error_1.LockError.LockAlreadyHeld({ filePath: err.file || err.path }, err);
                    case 'ENOTACQUIRED': // proper-lockfile code
                        throw lock_error_1.LockError.LockNotFound({ filePath: err.file }, err);
                    case 'ECOMPROMISED': // proper-lockfile code
                        throw lock_error_1.LockError.Unknown({ reason: 'Lock compromised', filePath: err.file }, err);
                    case 'ERELEASED': // proper-lockfile code
                        throw lock_error_1.LockError.LockNotFound({
                            reason: 'Lock already released',
                            filePath: err.file,
                        }, err);
                    default:
                        throw lock_error_1.LockError.Unknown({ originalCode: err?.code }, err);
                }
            }
        };
        return descriptor;
    };
}


/***/ }),
/* 53 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandleStorageFsErrors = HandleStorageFsErrors;
const storage_error_1 = __webpack_require__(19);
const _error_1 = __webpack_require__(36);
/**
 * A method decorator that wraps storage methods in a try...catch block.
i * 스토리지 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * It provides centralized handling for file system errors, translating
 * them into appropriate StorageError instances.
 *
 * 파일 시스템 오류에 대한 중앙 집중식 처리를 제공하여
 * 적절한 StorageError 인스턴스로 변환합니다.
 *
 * This decorator catches common file system errors (ENOENT, EEXIST, EACCES, EPERM)
 * and converts them to domain-specific StorageError objects with proper error codes
 * and additional context.
 *
 * 이 데코레이터는 일반적인 파일 시스템 오류(ENOENT, EEXIST, EACCES, EPERM)를
 * 포착하여 적절한 오류 코드와 추가 컨텍스트가 있는 도메인별 StorageError 객체로 변환합니다.
 *
 * @category Decorators
 * @since 1.0.0
 * @example
 * ```typescript
 * class StorageService {
 *   @HandleStorageFsErrors()
 *   async readFile(path: string): Promise<string> {
 *     return fs.readFile(path, 'utf-8');
 *   }
 * }
 * ```
 */
function HandleStorageFsErrors() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            try {
                return await originalMethod.apply(this, args);
            }
            catch (err) {
                if (err instanceof _error_1.AppError) {
                    throw err;
                }
                switch (err?.code) {
                    case 'ENOENT':
                        throw storage_error_1.StorageError.NoSuchFile({ filePath: err.path }, err);
                    case 'EEXIST':
                        throw storage_error_1.StorageError.AlreadyExists({ filePath: err.path }, err);
                    case 'EACCES':
                    case 'EPERM':
                        throw storage_error_1.StorageError.PermissionDenied({ filePath: err.path }, err);
                    default:
                        throw storage_error_1.StorageError.Unknown({
                            originalCode: err?.code,
                            originalMessage: err?.message,
                        }, err);
                }
            }
        };
        return descriptor;
    };
}


/***/ }),
/* 54 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandleUserRepoErrors = HandleUserRepoErrors;
const user_error_1 = __webpack_require__(40);
const lock_error_1 = __webpack_require__(39);
const storage_error_1 = __webpack_require__(19);
/**
 * A method decorator that wraps a repository method in a try...catch block.
 * 리포지토리 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * It provides centralized handling for LockError and StorageError, translating
 * them into the appropriate domain-specific UserError.
 *
 * LockError와 StorageError에 대한 중앙 집중식 처리를 제공하여
 * 적절한 도메인별 UserError로 변환합니다.
 *
 * @assumption This decorator assumes that the first argument of the decorated
 * method is a string (e.g., userId) that can be used for logging context.
 *
 * @가정 이 데코레이터는 데코레이팅된 메서드의 첫 번째 인수가
 * 로깅 컨텍스트에 사용할 수 있는 문자열(예: userId)이라고 가정합니다.
 *
 * @category Decorators
 * @since 1.0.0
 */
function HandleUserRepoErrors() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            try {
                return await originalMethod.apply(this, args);
            }
            catch (err) {
                const contextId = args[0] || 'unknown';
                if (err instanceof storage_error_1.StorageError) {
                    switch (err.code) {
                        case storage_error_1.StorageErrorCode.NO_SUCH_FILE:
                        case storage_error_1.StorageErrorCode.FILE_NOT_FOUND: // Deprecated
                            throw user_error_1.UserError.UserNotFound({ userId: contextId }, err);
                        case storage_error_1.StorageErrorCode.FILE_ALREADY_EXISTS:
                            throw user_error_1.UserError.UserAlreadyExists({ userId: contextId }, err);
                        default:
                            throw user_error_1.UserError.Unknown({
                                resourceId: contextId,
                                storageError: err.code,
                            }, err);
                    }
                }
                if (err instanceof lock_error_1.LockError) {
                    switch (err.code) {
                        case lock_error_1.LockErrorCode.LOCK_NOT_FOUND:
                            if (err.message?.includes('ENOENT')) {
                                throw user_error_1.UserError.UserNotFound({ userId: contextId }, err);
                            }
                            throw user_error_1.UserError.LockOperationFailed({ resourceId: contextId, reason: err.code }, err);
                        case lock_error_1.LockErrorCode.LOCK_ALREADY_HELD:
                            throw user_error_1.UserError.ResourceLocked({ resourceId: contextId }, err);
                        case lock_error_1.LockErrorCode.PERMISSION_DENIED:
                        case lock_error_1.LockErrorCode.STALE_LOCK:
                        case lock_error_1.LockErrorCode.UNKNOWN:
                        default:
                            throw user_error_1.UserError.LockOperationFailed({ resourceId: contextId, reason: err.code }, err);
                    }
                }
                throw err;
            }
        };
        return descriptor;
    };
}


/***/ }),
/* 55 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isInvalidTokenError = isInvalidTokenError;
exports.checkCmsTokenError = checkCmsTokenError;
exports.HandleCmsTokenErrors = HandleCmsTokenErrors;
const cms_error_1 = __webpack_require__(45);
/**
 * Invalid token error message from CMS.
 * CMS에서 반환하는 유효하지 않은 토큰 오류 메시지입니다.
 */
const INVALID_TOKEN_MESSAGE = 'Request is rejected due to invalid token. Please reconnect.';
/**
 * Checks if a CMS response indicates an invalid token error.
 * CMS 응답이 유효하지 않은 토큰 오류를 나타내는지 확인합니다.
 *
 * @param response - The CMS response to check
 * @returns true if the response indicates an invalid token
 */
function isInvalidTokenError(response) {
    if (!response || typeof response !== 'object') {
        return false;
    }
    if ('note' in response) {
        return response.note === INVALID_TOKEN_MESSAGE;
    }
    return false;
}
/**
 * Checks a CMS response for invalid token errors and throws CmsError.InvalidToken() if found.
 * This is a helper function that can be used directly in service methods.
 *
 * CMS 응답에서 유효하지 않은 토큰 오류를 확인하고, 발견되면 CmsError.InvalidToken()을 던집니다.
 * 서비스 메서드에서 직접 사용할 수 있는 헬퍼 함수입니다.
 *
 * @param response - The CMS response to check
 * @throws CmsError.InvalidToken if the response indicates an invalid token
 * @example
 * ```typescript
 * async startInfo(...): Promise<StartInfoClientResponse> {
 *   const response = await this.cmsClient.postAuthenticated(...);
 *   checkCmsTokenError(response);  // 자동으로 token 에러 체크
 *   // ... 나머지 처리
 * }
 * ```
 */
function checkCmsTokenError(response) {
    if (isInvalidTokenError(response)) {
        throw cms_error_1.CmsError.InvalidToken();
    }
}
/**
 * A method decorator that automatically checks CMS responses for invalid token errors.
 * CMS 응답에서 유효하지 않은 토큰 오류를 자동으로 확인하는 메서드 데코레이터입니다.
 *
 * This decorator wraps methods that return CMS responses and checks if the response
 * indicates an invalid token. If so, it throws CmsError.InvalidToken().
 *
 * 이 데코레이터는 CMS 응답을 반환하는 메서드를 감싸고, 응답이 유효하지 않은 토큰을
 * 나타내는지 확인합니다. 그렇다면 CmsError.InvalidToken()을 던집니다.
 *
 * @category Decorators
 * @since 1.0.0
 * @example
 * ```typescript
 * class DatabaseService {
 *   @HandleCmsTokenErrors()
 *   async startInfo(userId: string, hostUid: string): Promise<StartInfoCmsResponse> {
 *     const response = await this.cmsClient.postAuthenticated(...);
 *     return response;  // 데코레이터가 자동으로 token 에러 체크
 *   }
 * }
 * ```
 */
function HandleCmsTokenErrors() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const result = await originalMethod.apply(this, args);
            if (result instanceof Promise) {
                return result.then((response) => {
                    if (isInvalidTokenError(response)) {
                        throw cms_error_1.CmsError.InvalidToken();
                    }
                    return response;
                });
            }
            if (isInvalidTokenError(result)) {
                throw cms_error_1.CmsError.InvalidToken();
            }
            return result;
        };
        return descriptor;
    };
}


/***/ }),
/* 56 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandleCmsHttpsClientErrors = HandleCmsHttpsClientErrors;
const cms_error_1 = __webpack_require__(45);
const app_error_1 = __webpack_require__(20);
const common_1 = __webpack_require__(6);
/**
 * A method decorator that wraps CMS client methods in a try...catch block.
 * CMS 클라이언트 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * It provides centralized handling for HTTP/Axios errors when communicating
 * with CMS services, translating them into appropriate CmsError instances.
 *
 * CMS 서비스와 통신할 때 HTTP/Axios 오류에 대한 중앙 집중식 처리를 제공하여
 * 적절한 CmsError 인스턴스로 변환합니다.
 *
 * This decorator handles various HTTP error scenarios:
 * - Response errors (4xx, 5xx status codes)
 * - Request errors (network issues, timeouts)
 * - Unknown errors
 *
 * 이 데코레이터는 다양한 HTTP 오류 시나리오를 처리합니다:
 * - 응답 오류 (4xx, 5xx 상태 코드)
 * - 요청 오류 (네트워크 문제, 타임아웃)
 * - 알 수 없는 오류
 *
 * @category Decorators
 * @since 1.0.0
 * @example
 * ```typescript
 * class CmsHttpsClientService {
 *   @HandleCmsHttpsClientErrors()
 *   async postData(url: string, data: any): Promise<any> {
 *     return this.httpService.post(url, data);
 *   }
 * }
 * ```
 */
function HandleCmsHttpsClientErrors() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            try {
                return await originalMethod.apply(this, args);
            }
            catch (error) {
                if (error instanceof app_error_1.AppError) {
                    throw error;
                }
                // Check if error has axios-like structure
                if (error?.response || error?.request || error?.config) {
                    const axiosError = error;
                    if (axiosError.response) {
                        throw cms_error_1.CmsError.RequestFailed({
                            status: axiosError.response.status,
                            data: axiosError.response.data,
                        }, error);
                    }
                    else if (axiosError.request) {
                        common_1.Logger.log(axiosError.request);
                        throw cms_error_1.CmsError.NoResponse(undefined, error);
                    }
                }
                throw cms_error_1.CmsError.Unknown({ message: error.message || 'Unknown error' }, error);
            }
        };
        return descriptor;
    };
}


/***/ }),
/* 57 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isCmsStatusFailure = isCmsStatusFailure;
exports.checkCmsStatusError = checkCmsStatusError;
exports.HandleCmsStatusErrors = HandleCmsStatusErrors;
const cms_error_1 = __webpack_require__(45);
/**
 * Checks if a CMS response indicates a failure (status === 'fail').
 * CMS 응답이 실패를 나타내는지 확인합니다 (status === 'fail').
 *
 * @param response - The CMS response to check
 * @returns true if the response indicates a failure
 */
function isCmsStatusFailure(response) {
    if (!response || typeof response !== 'object') {
        return false;
    }
    if ('status' in response) {
        return response.status === 'fail';
    }
    return false;
}
/**
 * Checks a CMS response for failure status and throws CmsError.RequestFailed if found.
 * This is a helper function that can be used directly in service methods.
 *
 * CMS 응답의 status 필드를 확인하고, 'fail'이면 CmsError.RequestFailed를 던집니다.
 * 서비스 메서드에서 직접 사용할 수 있는 헬퍼 함수입니다.
 *
 * @param response - The CMS response to check
 * @param errorMessage - Optional custom error message
 * @throws CmsError.RequestFailed if the response status is 'fail'
 * @example
 * ```typescript
 * async getBrokerLogList(...): Promise<GetBrokerLogListClientResponse> {
 *   const cmsResponse = await this.client.forwardAuthenticated(...);
 *   checkCmsStatusError(cmsResponse);  // 자동으로 status === 'fail' 체크
 *   // ... 나머지 처리
 * }
 * ```
 */
function checkCmsStatusError(response, errorMessage) {
    if (isCmsStatusFailure(response)) {
        throw cms_error_1.CmsError.RequestFailed({
            message: errorMessage || `CMS request failed: ${response.note || 'Unknown error'}`,
            response: response,
        });
    }
}
/**
 * A method decorator that automatically checks CMS responses for failure status.
 * CMS 응답의 status 필드가 'fail'인 경우 자동으로 에러를 던지는 메서드 데코레이터입니다.
 *
 * CMS는 HTTP 201로 응답하지만 body의 status 필드가 'fail'일 수 있습니다.
 * 이 decorator는 메서드의 반환값을 체크하여 status가 'fail'이면 CmsError.RequestFailed를 던집니다.
 *
 * CMS returns HTTP 201 but the body's status field may be 'fail'.
 * This decorator checks the method's return value and throws CmsError.RequestFailed if status is 'fail'.
 *
 * @category Decorators
 * @since 1.0.0
 * @example
 * ```typescript
 * class LogService {
 *   @HandleCmsStatusErrors()
 *   async getBrokerLogList(...): Promise<GetBrokerLogListClientResponse> {
 *     const response = await this.client.forwardAuthenticated(...);
 *     // decorator가 자동으로 status === 'fail' 체크
 *     return { broker: response.broker, logfileinfo: response.logfileinfo };
 *   }
 * }
 * ```
 */
function HandleCmsStatusErrors() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const result = await originalMethod.apply(this, args);
            if (result instanceof Promise) {
                return result.then((response) => {
                    checkCmsStatusError(response);
                    return response;
                });
            }
            checkCmsStatusError(result);
            return result;
        };
        return descriptor;
    };
}


/***/ }),
/* 58 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandleDatabaseErrors = HandleDatabaseErrors;
const index_1 = __webpack_require__(36);
/**
 * A method decorator that wraps database service methods in a try...catch block.
 * 데이터베이스 서비스 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * 에러를 변환하지 않고 그대로 전달합니다. 시스템/라이브러리 레벨 에러는
 * 하위 데코레이터에서 이미 AppError로 변환되었으므로 그대로 전달합니다.
 *
 * Errors are passed through as-is. System/library level errors are already
 * converted to AppError by lower-level decorators.
 *
 * @category Decorators
 * @since 1.0.0
 */
function HandleDatabaseErrors() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            try {
                return await originalMethod.apply(this, args);
            }
            catch (err) {
                if (err instanceof index_1.AppError) {
                }
                throw err;
            }
        };
    };
}


/***/ }),
/* 59 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandleResourceMonitoringErrors = HandleResourceMonitoringErrors;
const _error_1 = __webpack_require__(36);
/**
 * A method decorator that wraps resource monitoring service methods in a try...catch block.
 *
 * It translates underlying errors (like CmsError or HostError) into more specific
 * ResourceMonitoringError types.
 *
 * @category Decorators
 * @since 1.0.0
 */
function HandleResourceMonitoringErrors() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            try {
                return await originalMethod.apply(this, args);
            }
            catch (err) {
                // If it's already an AppError, let it pass through, unless it's a CmsError or HostError.
                if (err instanceof _error_1.AppError && !(err instanceof _error_1.CmsError) && !(err instanceof _error_1.HostError)) {
                    throw err;
                }
                // Handle CmsError
                if (err instanceof _error_1.CmsError) {
                    throw _error_1.ResourceMonitoringError.CmsApiFailure({
                        originalCode: err.code,
                        originalMessage: err.message,
                        ...err.additionalData,
                    }, err);
                }
                // Handle HostError (e.g., if findHostInternal fails)
                if (err instanceof _error_1.HostError) {
                    throw _error_1.ResourceMonitoringError.HostNotFound({
                        originalCode: err.code,
                        originalMessage: err.message,
                        ...err.additionalData,
                    }, err);
                }
                // For any other unknown errors, wrap them.
                console.error(`[HandleResourceMonitoringErrors] Unknown error in ${propertyKey}:`, err);
                throw _error_1.ResourceMonitoringError.Unknown({
                    originalMessage: err.message,
                }, err);
            }
        };
        return descriptor;
    };
}


/***/ }),
/* 60 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandleBrokerErrors = HandleBrokerErrors;
const _error_1 = __webpack_require__(36);
/**
 * A method decorator that wraps broker service methods in a try...catch block.
 *
 * It translates underlying errors (like CmsError or HostError) into more specific
 * BrokerError types.
 *
 * 브로커 서비스 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * 하위 에러(CmsError 또는 HostError)를 더 구체적인 BrokerError 타입으로 변환합니다.
 *
 * @category Decorators
 * @since 1.0.0
 */
function HandleBrokerErrors() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            try {
                return await originalMethod.apply(this, args);
            }
            catch (err) {
                // If it's already an AppError, let it pass through, unless it's a CmsError or HostError.
                if (err instanceof _error_1.AppError && !(err instanceof _error_1.CmsError) && !(err instanceof _error_1.HostError)) {
                    throw err;
                }
                // Handle CmsError
                if (err instanceof _error_1.CmsError) {
                    throw _error_1.BrokerError.GetBrokersFailed({
                        originalCode: err.code,
                        originalMessage: err.message,
                        ...err.additionalData,
                    }, err);
                }
                // Handle HostError (e.g., if findHostInternal fails)
                if (err instanceof _error_1.HostError) {
                    throw _error_1.BrokerError.GetBrokersFailed({
                        originalCode: err.code,
                        originalMessage: err.message,
                        ...err.additionalData,
                    }, err);
                }
                // For any other unknown errors, wrap them.
                console.error(`[HandleBrokerErrors] Unknown error in ${propertyKey}:`, err);
                throw _error_1.BrokerError.GetBrokersFailed({
                    originalMessage: err.message,
                }, err);
            }
        };
        return descriptor;
    };
}


/***/ }),
/* 61 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandleCmsConfigErrors = HandleCmsConfigErrors;
const _error_1 = __webpack_require__(36);
/**
 * A method decorator that wraps CMS config service methods in a try...catch block.
 *
 * It translates underlying errors (like CmsError or HostError) into appropriate error types.
 * Since CmsConfigService currently throws generic Error, we pass through CmsError
 * and convert HostError to a more descriptive error.
 *
 * CMS 설정 서비스 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * 하위 에러(CmsError 또는 HostError)를 적절한 에러 타입으로 변환합니다.
 * CmsConfigService가 현재 일반 Error를 던지므로, CmsError는 그대로 전달하고
 * HostError는 더 설명적인 에러로 변환합니다.
 *
 * @category Decorators
 * @since 1.0.0
 */
function HandleCmsConfigErrors() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            try {
                return await originalMethod.apply(this, args);
            }
            catch (err) {
                // If it's already an AppError, let it pass through, unless it's a CmsError or HostError.
                if (err instanceof _error_1.AppError && !(err instanceof _error_1.CmsError) && !(err instanceof _error_1.HostError)) {
                    throw err;
                }
                // Handle CmsError - pass through as CmsError since CmsConfigService may handle it
                if (err instanceof _error_1.CmsError) {
                    throw err;
                }
                // Handle HostError (e.g., if findHostInternal fails)
                if (err instanceof _error_1.HostError) {
                    throw new Error(`Failed to access CMS config: ${err.message || 'Host not found or inaccessible'}`);
                }
                // For any other unknown errors, wrap them.
                console.error(`[HandleCmsConfigErrors] Unknown error in ${propertyKey}:`, err);
                throw new Error(`CMS config operation failed: ${err.message || 'Unknown error'}`);
            }
        };
        return descriptor;
    };
}


/***/ }),
/* 62 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SuccessResponseInterceptor = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const operators_1 = __webpack_require__(63);
/**
 * Interceptor that wraps successful responses with a standard format.
 * 성공적인 응답을 표준 형식으로 래핑하는 인터셉터입니다.
 *
 * This ensures a consistent API response structure where clients can easily
 * check the success status of an operation.
 *
 * 이를 통해 클라이언트는 작업의 성공 상태를 쉽게 확인할 수 있는
 * 일관된 API 응답 구조를 보장합니다.
 *
 * @category Interceptors
 * @since 1.0.0
 */
let SuccessResponseInterceptor = class SuccessResponseInterceptor {
    intercept(context, next) {
        const response = context.switchToHttp().getResponse();
        return next.handle().pipe((0, operators_1.map)(data => {
            const statusCode = response.statusCode || common_1.HttpStatus.OK;
            const responseData = data === undefined ? null : data;
            return {
                data: responseData,
                status: statusCode,
                note: 'success',
            };
        }));
    }
};
exports.SuccessResponseInterceptor = SuccessResponseInterceptor;
exports.SuccessResponseInterceptor = SuccessResponseInterceptor = tslib_1.__decorate([
    (0, common_1.Injectable)()
], SuccessResponseInterceptor);


/***/ }),
/* 63 */
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),
/* 64 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggingInterceptor = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const operators_1 = __webpack_require__(63);
/**
 * Interceptor for logging incoming requests and outgoing responses.
 * 들어오는 요청과 나가는 응답을 로깅하기 위한 인터셉터입니다.
 *
 * This interceptor logs details about the HTTP request before it's handled by the controller
 * and logs details about the response (or error) after the controller has processed it.
 *
 * 이 인터셉터는 컨트롤러가 처리하기 전에 HTTP 요청에 대한 세부 정보를 로깅하고,
 * 컨트롤러가 처리한 후 응답(또는 오류)에 대한 세부 정보를 로깅합니다.
 *
 * @category Interceptors
 * @since 1.0.0
 */
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger(LoggingInterceptor_1.name);
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const now = Date.now();
        this.logger.log(`Incoming Request: ${request.method} ${request.url}`, `IP: ${request.ip}`, `Headers: ${JSON.stringify(request.headers)}`, `Body: ${JSON.stringify(request.body)}`);
        return next.handle().pipe((0, operators_1.tap)({
            next: (data) => {
                this.logger.log(`Outgoing Response: ${request.method} ${request.url} - ${response.statusCode}`, `Duration: ${Date.now() - now}ms`, `Response Body (partial): ${JSON.stringify(data).substring(0, 200)}...`);
            },
            error: (error) => {
                this.logger.error(`Error Response: ${request.method} ${request.url} - ${error.status || 'N/A'}`, `Duration: ${Date.now() - now}ms`, `Error Message: ${error.message}`, error.stack);
            }
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = tslib_1.__decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);


/***/ }),
/* 65 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LockModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const lock_service_1 = __webpack_require__(30);
/**
 * Module for managing file locking functionalities.
 *
 * 파일 잠금 기능을 관리하기 위한 모듈입니다.
 *
 * @category Modules
 * @since 1.0.0
 */
let LockModule = class LockModule {
};
exports.LockModule = LockModule;
exports.LockModule = LockModule = tslib_1.__decorate([
    (0, common_1.Module)({
        providers: [lock_service_1.LockService],
        exports: [lock_service_1.LockService],
    })
], LockModule);


/***/ }),
/* 66 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserRepositoryService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const uuid_1 = __webpack_require__(67);
const index_1 = __webpack_require__(68);
const lock_service_1 = __webpack_require__(30);
const encryption_service_1 = __webpack_require__(13);
const password_service_1 = __webpack_require__(14);
const storage_service_1 = __webpack_require__(18);
const handle_user_repo_errors_decorator_1 = __webpack_require__(54);
/**
 * Service for user data repository operations.
 * 사용자 데이터 리포지토리 작업을 위한 서비스입니다.
 *
 * Provides low-level data access operations for user management including
 * CRUD operations, file-based storage, and data persistence.
 *
 * CRUD 작업, 파일 기반 저장소 및 데이터 영속성을 포함한
 * 사용자 관리를 위한 하위 수준 데이터 액세스 작업을 제공합니다.
 *
 * @category Infrastructure Services
 * @since 1.0.0
 */
let UserRepositoryService = class UserRepositoryService {
    constructor(encryptionService, passwordService, storageService, lockService) {
        this.encryptionService = encryptionService;
        this.passwordService = passwordService;
        this.storageService = storageService;
        this.lockService = lockService;
    }
    /**
     * Loads a user by their ID.
     * 사용자 ID로 사용자를 로드합니다.
     *
     * The ID is hashed before being used to read from storage.
     * ID는 저장소에서 읽기 전에 해싱됩니다.
     *
     * @param id - The user's ID.
     * @returns A Promise that resolves with the User object.
     * @throws UserError.UserNotFound if the user file is not found.
     */
    async loadUserById(id) {
        const hashedId = this.encryptionService.getHashedValue(id);
        const encrypted = await this.storageService.read(hashedId);
        const userJson = JSON.parse(this.encryptionService.decryptValue(encrypted));
        return userJson;
    }
    /**
     * Creates a new user.
     * 새 사용자를 생성합니다.
     *
     * The user's ID is hashed, and the user data is encrypted before being written to storage.
     * 사용자 ID는 해싱되고, 사용자 데이터는 저장소에 쓰기 전에 암호화됩니다.
     *
     * @param dto - The UserDTO containing the user's ID and password.
     * @returns A Promise that resolves when the user is created.
     * @throws UserError.UserAlreadyExists if a user with the given ID already exists.
     */
    async createUser(dto) {
        const hashedId = this.encryptionService.getHashedValue(dto.id);
        const uuid = (0, uuid_1.v4)();
        const userJson = {
            uuid,
            id: dto.id,
            password: await this.passwordService.getHashedValue(dto.password),
            department: 'default',
            host_list: {},
            ha_mon_list: {},
            resource_mon_list: {},
            user_preference: { dashboardInterval: 0, brokerStatusInterval: 0 },
        };
        await this.storageService.createAndWrite(hashedId, this.encryptionService.encryptValue(JSON.stringify(userJson)));
    }
    /**
     * Deletes a user by their ID.
     * 사용자 ID로 사용자를 삭제합니다.
     *
     * The user's ID is hashed before being used to delete from storage.
     * 사용자 ID는 저장소에서 삭제하기 전에 해싱됩니다.
     *
     * @param id - The user's ID.
     * @returns A Promise that resolves when the user is deleted.
     * @throws UserError.UserNotFound if the user file is not found.
     */
    async deleteUser(id) {
        const hashedId = this.encryptionService.getHashedValue(id);
        await this.storageService.delete(hashedId);
    }
    /**
     * Updates a user's data.
     * 사용자 데이터를 업데이트합니다.
     *
     * The user's ID is hashed, and the updated user data is encrypted before being written to storage.
     * 사용자 ID는 해싱되고, 업데이트된 사용자 데이터는 저장소에 쓰기 전에 암호화됩니다.
     *
     * @param id - The user's ID.
     * @param userJson - The updated User object.
     * @returns A Promise that resolves when the user is updated.
     * @throws UserError.UserNotFound if the user file is not found.
     */
    async updateUser(id, userJson) {
        const hashedId = this.encryptionService.getHashedValue(id);
        const encrypted = this.encryptionService.encryptValue(JSON.stringify(userJson));
        await this.storageService.write(hashedId, encrypted);
    }
    /**
     * Performs an atomic update on a user's data.
     * 사용자 데이터에 대한 원자적 업데이트를 수행합니다.
     *
     * Acquires a lock on the user file, reads the data, applies a modifier function,
     * and then writes the updated data back to storage, releasing the lock afterwards.
     *
     * 사용자 파일에 잠금을 획득하고, 데이터를 읽고, 수정자 함수를 적용한 다음,
     * 업데이트된 데이터를 저장소에 다시 쓰고 잠금을 해제합니다.
     *
     * @param id - The user's ID.
     * @param modifierCallback - An asynchronous function that modifies the User object.
     * @returns A Promise that resolves with the updated User object.
     * @throws UserError if any lock or storage operation fails.
     */
    async atomicUpdateUser(id, modifierCallback) {
        const hashedId = this.encryptionService.getHashedValue(id);
        const updated = await this.lockService.withLock(hashedId, async () => {
            const encrypted = await this.storageService.readUnsafe(hashedId);
            const decrypted = await this.encryptionService.decryptValue(encrypted);
            const userJson = await JSON.parse(decrypted);
            await modifierCallback(userJson);
            const newEncryted = await this.encryptionService.encryptValue(JSON.stringify(userJson));
            await this.storageService.writeUnsafe(hashedId, newEncryted);
            return userJson;
        });
        return updated;
    }
};
exports.UserRepositoryService = UserRepositoryService;
tslib_1.__decorate([
    (0, handle_user_repo_errors_decorator_1.HandleUserRepoErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], UserRepositoryService.prototype, "loadUserById", null);
tslib_1.__decorate([
    (0, handle_user_repo_errors_decorator_1.HandleUserRepoErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_f = typeof index_1.UserDTO !== "undefined" && index_1.UserDTO) === "function" ? _f : Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], UserRepositoryService.prototype, "createUser", null);
tslib_1.__decorate([
    (0, handle_user_repo_errors_decorator_1.HandleUserRepoErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], UserRepositoryService.prototype, "deleteUser", null);
tslib_1.__decorate([
    (0, handle_user_repo_errors_decorator_1.HandleUserRepoErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_j = typeof index_1.User !== "undefined" && index_1.User) === "function" ? _j : Object]),
    tslib_1.__metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], UserRepositoryService.prototype, "updateUser", null);
tslib_1.__decorate([
    (0, handle_user_repo_errors_decorator_1.HandleUserRepoErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Function]),
    tslib_1.__metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], UserRepositoryService.prototype, "atomicUpdateUser", null);
exports.UserRepositoryService = UserRepositoryService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof encryption_service_1.EncryptionService !== "undefined" && encryption_service_1.EncryptionService) === "function" ? _a : Object, typeof (_b = typeof password_service_1.PasswordService !== "undefined" && password_service_1.PasswordService) === "function" ? _b : Object, typeof (_c = typeof storage_service_1.StorageService !== "undefined" && storage_service_1.StorageService) === "function" ? _c : Object, typeof (_d = typeof lock_service_1.LockService !== "undefined" && lock_service_1.LockService) === "function" ? _d : Object])
], UserRepositoryService);


/***/ }),
/* 67 */
/***/ ((module) => {

module.exports = require("uuid");

/***/ }),
/* 68 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(3);
// Core types
tslib_1.__exportStar(__webpack_require__(69), exports);
tslib_1.__exportStar(__webpack_require__(70), exports);
tslib_1.__exportStar(__webpack_require__(71), exports);
tslib_1.__exportStar(__webpack_require__(72), exports);
tslib_1.__exportStar(__webpack_require__(73), exports);
// DTOs
tslib_1.__exportStar(__webpack_require__(74), exports);
// Requests
tslib_1.__exportStar(__webpack_require__(79), exports);
// Responses
tslib_1.__exportStar(__webpack_require__(105), exports);
// CMS types
tslib_1.__exportStar(__webpack_require__(134), exports);
tslib_1.__exportStar(__webpack_require__(162), exports);


/***/ }),
/* 69 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 70 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 71 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 72 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 73 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 74 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(3);
// DTO exports
tslib_1.__exportStar(__webpack_require__(75), exports);
tslib_1.__exportStar(__webpack_require__(76), exports);
tslib_1.__exportStar(__webpack_require__(77), exports);
tslib_1.__exportStar(__webpack_require__(78), exports);


/***/ }),
/* 75 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserDTO = void 0;
/**
 * Data Transfer Object for user authentication.
 * 사용자 인증을 위한 데이터 전송 객체입니다.
 *
 * Used for login and registration requests containing
 * user credentials.
 *
 * 사용자 자격 증명을 포함하는 로그인 및 등록 요청에 사용됩니다.
 *
 * @category DTOs
 * @since 1.0.0
 */
class UserDTO {
}
exports.UserDTO = UserDTO;


/***/ }),
/* 76 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 77 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 78 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateUserDto = exports.UserPreferenceDto = void 0;
class UserPreferenceDto {
}
exports.UserPreferenceDto = UserPreferenceDto;
class UpdateUserDto {
}
exports.UpdateUserDto = UpdateUserDto;


/***/ }),
/* 79 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(3);
// Request exports
tslib_1.__exportStar(__webpack_require__(80), exports);
tslib_1.__exportStar(__webpack_require__(81), exports);
tslib_1.__exportStar(__webpack_require__(82), exports);
tslib_1.__exportStar(__webpack_require__(83), exports);
tslib_1.__exportStar(__webpack_require__(84), exports);
tslib_1.__exportStar(__webpack_require__(85), exports);
tslib_1.__exportStar(__webpack_require__(86), exports);
tslib_1.__exportStar(__webpack_require__(87), exports);
tslib_1.__exportStar(__webpack_require__(88), exports);
tslib_1.__exportStar(__webpack_require__(89), exports);
tslib_1.__exportStar(__webpack_require__(90), exports);
tslib_1.__exportStar(__webpack_require__(91), exports);
// Client request aliases
tslib_1.__exportStar(__webpack_require__(92), exports);
tslib_1.__exportStar(__webpack_require__(93), exports);
tslib_1.__exportStar(__webpack_require__(94), exports);
tslib_1.__exportStar(__webpack_require__(95), exports);
tslib_1.__exportStar(__webpack_require__(96), exports);
tslib_1.__exportStar(__webpack_require__(97), exports);
tslib_1.__exportStar(__webpack_require__(98), exports);
tslib_1.__exportStar(__webpack_require__(99), exports);
tslib_1.__exportStar(__webpack_require__(100), exports);
tslib_1.__exportStar(__webpack_require__(101), exports);
tslib_1.__exportStar(__webpack_require__(102), exports);
tslib_1.__exportStar(__webpack_require__(103), exports);
tslib_1.__exportStar(__webpack_require__(104), exports);


/***/ }),
/* 80 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 81 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 82 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 83 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 84 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 85 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 86 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 87 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 88 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 89 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 90 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 91 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 92 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 93 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 94 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 95 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 96 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 97 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 98 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 99 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 100 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 101 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 102 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 103 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 104 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 105 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(3);
// Response exports
tslib_1.__exportStar(__webpack_require__(106), exports);
tslib_1.__exportStar(__webpack_require__(107), exports);
tslib_1.__exportStar(__webpack_require__(108), exports);
tslib_1.__exportStar(__webpack_require__(109), exports);
tslib_1.__exportStar(__webpack_require__(110), exports);
tslib_1.__exportStar(__webpack_require__(111), exports);
tslib_1.__exportStar(__webpack_require__(112), exports);
// Client response aliases
tslib_1.__exportStar(__webpack_require__(113), exports);
tslib_1.__exportStar(__webpack_require__(114), exports);
tslib_1.__exportStar(__webpack_require__(115), exports);
tslib_1.__exportStar(__webpack_require__(116), exports);
tslib_1.__exportStar(__webpack_require__(117), exports);
tslib_1.__exportStar(__webpack_require__(118), exports);
tslib_1.__exportStar(__webpack_require__(119), exports);
tslib_1.__exportStar(__webpack_require__(120), exports);
tslib_1.__exportStar(__webpack_require__(121), exports);
tslib_1.__exportStar(__webpack_require__(122), exports);
tslib_1.__exportStar(__webpack_require__(123), exports);
tslib_1.__exportStar(__webpack_require__(124), exports);
tslib_1.__exportStar(__webpack_require__(125), exports);
tslib_1.__exportStar(__webpack_require__(126), exports);
tslib_1.__exportStar(__webpack_require__(127), exports);
tslib_1.__exportStar(__webpack_require__(128), exports);
tslib_1.__exportStar(__webpack_require__(129), exports);
tslib_1.__exportStar(__webpack_require__(130), exports);
tslib_1.__exportStar(__webpack_require__(131), exports);
tslib_1.__exportStar(__webpack_require__(132), exports);
tslib_1.__exportStar(__webpack_require__(133), exports);


/***/ }),
/* 106 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 107 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 108 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 109 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 110 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateLoginResponse = CreateLoginResponse;
/**
 * Factory function to create a login response.
 * 로그인 응답을 생성하는 팩토리 함수입니다.
 *
 * @param token - The JWT token to include in the response / 응답에 포함할 JWT 토큰
 * @returns LoginResponse object containing the token / 토큰을 포함하는 LoginResponse 객체
 * @category Responses
 * @since 1.0.0
 */
function CreateLoginResponse(token) {
    const response = {
        token: token,
    };
    return response;
}


/***/ }),
/* 111 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 112 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 113 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 114 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 115 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 116 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 117 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 118 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 119 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 120 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 121 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 122 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 123 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 124 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 125 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 126 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 127 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 128 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 129 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 130 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 131 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 132 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 133 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 134 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(3);
// CMS Request exports
tslib_1.__exportStar(__webpack_require__(135), exports);
tslib_1.__exportStar(__webpack_require__(136), exports);
tslib_1.__exportStar(__webpack_require__(137), exports);
tslib_1.__exportStar(__webpack_require__(138), exports);
tslib_1.__exportStar(__webpack_require__(139), exports);
tslib_1.__exportStar(__webpack_require__(140), exports);
tslib_1.__exportStar(__webpack_require__(141), exports);
tslib_1.__exportStar(__webpack_require__(142), exports);
tslib_1.__exportStar(__webpack_require__(143), exports);
tslib_1.__exportStar(__webpack_require__(144), exports);
tslib_1.__exportStar(__webpack_require__(145), exports);
tslib_1.__exportStar(__webpack_require__(146), exports);
tslib_1.__exportStar(__webpack_require__(147), exports);
tslib_1.__exportStar(__webpack_require__(148), exports);
tslib_1.__exportStar(__webpack_require__(149), exports);
tslib_1.__exportStar(__webpack_require__(150), exports);
tslib_1.__exportStar(__webpack_require__(151), exports);
tslib_1.__exportStar(__webpack_require__(152), exports);
tslib_1.__exportStar(__webpack_require__(153), exports);
tslib_1.__exportStar(__webpack_require__(154), exports);
tslib_1.__exportStar(__webpack_require__(155), exports);
tslib_1.__exportStar(__webpack_require__(156), exports);
tslib_1.__exportStar(__webpack_require__(157), exports);
tslib_1.__exportStar(__webpack_require__(158), exports);
tslib_1.__exportStar(__webpack_require__(159), exports);
tslib_1.__exportStar(__webpack_require__(160), exports);
tslib_1.__exportStar(__webpack_require__(161), exports);


/***/ }),
/* 135 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 136 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 137 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 138 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 139 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 140 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 141 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 142 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 143 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 144 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 145 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 146 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 147 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 148 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 149 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 150 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 151 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 152 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 153 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 154 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 155 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 156 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 157 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 158 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 159 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 160 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 161 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 162 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(3);
// CMS Response exports
tslib_1.__exportStar(__webpack_require__(163), exports);
tslib_1.__exportStar(__webpack_require__(164), exports);
tslib_1.__exportStar(__webpack_require__(165), exports);
tslib_1.__exportStar(__webpack_require__(166), exports);
tslib_1.__exportStar(__webpack_require__(167), exports);
tslib_1.__exportStar(__webpack_require__(168), exports);
tslib_1.__exportStar(__webpack_require__(169), exports);
tslib_1.__exportStar(__webpack_require__(170), exports);
tslib_1.__exportStar(__webpack_require__(171), exports);
tslib_1.__exportStar(__webpack_require__(172), exports);
tslib_1.__exportStar(__webpack_require__(173), exports);
tslib_1.__exportStar(__webpack_require__(174), exports);
tslib_1.__exportStar(__webpack_require__(175), exports);
tslib_1.__exportStar(__webpack_require__(176), exports);
tslib_1.__exportStar(__webpack_require__(177), exports);
tslib_1.__exportStar(__webpack_require__(178), exports);
tslib_1.__exportStar(__webpack_require__(179), exports);
tslib_1.__exportStar(__webpack_require__(180), exports);
tslib_1.__exportStar(__webpack_require__(181), exports);
tslib_1.__exportStar(__webpack_require__(182), exports);
tslib_1.__exportStar(__webpack_require__(183), exports);
tslib_1.__exportStar(__webpack_require__(184), exports);


/***/ }),
/* 163 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 164 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 165 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 166 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 167 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 168 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 169 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 170 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 171 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 172 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 173 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 174 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 175 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 176 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 177 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 178 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 179 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 180 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 181 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 182 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 183 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 184 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 185 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PasswordService = exports.EncryptionService = exports.SecurityModule = void 0;
// Export module
var security_module_1 = __webpack_require__(12);
Object.defineProperty(exports, "SecurityModule", ({ enumerable: true, get: function () { return security_module_1.SecurityModule; } }));
// Export services
var encryption_service_1 = __webpack_require__(13);
Object.defineProperty(exports, "EncryptionService", ({ enumerable: true, get: function () { return encryption_service_1.EncryptionService; } }));
var password_service_1 = __webpack_require__(14);
Object.defineProperty(exports, "PasswordService", ({ enumerable: true, get: function () { return password_service_1.PasswordService; } }));


/***/ }),
/* 186 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = exports.JwtAuthGuard = exports.TokenModule = void 0;
// Export module
var token_module_1 = __webpack_require__(187);
Object.defineProperty(exports, "TokenModule", ({ enumerable: true, get: function () { return token_module_1.TokenModule; } }));
// Export guards
var jwt_auth_guard_1 = __webpack_require__(191);
Object.defineProperty(exports, "JwtAuthGuard", ({ enumerable: true, get: function () { return jwt_auth_guard_1.JwtAuthGuard; } }));
// Export strategies
var jwt_strategy_1 = __webpack_require__(189);
Object.defineProperty(exports, "JwtStrategy", ({ enumerable: true, get: function () { return jwt_strategy_1.JwtStrategy; } }));


/***/ }),
/* 187 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TokenModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const jwt_1 = __webpack_require__(188);
const passport_1 = __webpack_require__(16);
const config_module_1 = __webpack_require__(7);
const config_service_1 = __webpack_require__(8);
const jwt_strategy_1 = __webpack_require__(189);
/**
 * Module for managing JWT authentication and token-related functionalities.
 *
 * JWT 인증 및 토큰 관련 기능을 관리하기 위한 모듈입니다.
 *
 * @category Modules
 * @since 1.0.0
 */
let TokenModule = class TokenModule {
};
exports.TokenModule = TokenModule;
exports.TokenModule = TokenModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_module_1.ConfigModule],
                inject: [config_service_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.getSecretKey(),
                    signOptions: { expiresIn: '1h' },
                }),
            }),
        ],
        exports: [jwt_1.JwtModule, passport_1.PassportModule],
        providers: [jwt_strategy_1.JwtStrategy],
    })
], TokenModule);


/***/ }),
/* 188 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 189 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const passport_1 = __webpack_require__(16);
const config_service_1 = __webpack_require__(8);
const passport_jwt_1 = __webpack_require__(190);
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(config) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.getSecretKey(),
        });
        this.config = config;
    }
    async validate(payload) {
        return payload;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof config_service_1.ConfigService !== "undefined" && config_service_1.ConfigService) === "function" ? _a : Object])
], JwtStrategy);


/***/ }),
/* 190 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 191 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const passport_1 = __webpack_require__(16);
const core_1 = __webpack_require__(1);
const jwt_1 = __webpack_require__(188);
const auth_error_1 = __webpack_require__(44);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);
        return isPublic ? true : super.canActivate(context);
    }
    handleRequest(err, user, info, context, status) {
        if (!user) {
            throw auth_error_1.AuthError.InvalidToken({ userId: 'unknown' }, new Error('User not found or invalid token'));
        }
        if (info instanceof jwt_1.TokenExpiredError ||
            info instanceof jwt_1.JsonWebTokenError) {
            throw auth_error_1.AuthError.InvalidToken({ userId: user?.sub || 'unknown' }, info);
        }
        else if (err instanceof Error) {
            throw auth_error_1.AuthError.InternalError({ userId: user?.sub || 'unknown' }, err);
        }
        return super.handleRequest(err, user, info, context, status);
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], JwtAuthGuard);


/***/ }),
/* 192 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const auth_service_1 = __webpack_require__(193);
const index_1 = __webpack_require__(68);
const _common_1 = __webpack_require__(32);
/**
 * Controller for handling authentication operations.
 * 인증 작업을 처리하는 컨트롤러입니다.
 *
 * Provides endpoints for user login and registration. These endpoints are
 * marked as public and do not require JWT authentication.
 *
 * 사용자 로그인과 등록을 위한 엔드포인트를 제공합니다.
 * 이러한 엔드포인트는 공개로 표시되며 JWT 인증이 필요하지 않습니다.
 *
 * @category Controllers
 * @since 1.0.0
 */
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    /**
     * Authenticates a user and returns a JWT token.
     *
     * Validates user credentials and returns a JWT token for authenticated
     * requests. This endpoint is public and does not require authentication.
     *
     * @param {UserDTO} userDTO - User credentials containing id and password
     * @returns {Promise<LoginResponse>} Response containing the JWT token
     * @throws {UserError} When user is not found or password is incorrect
     * @example
     * ```typescript
     * // POST /auth/login
     * // Body: { id: "user123", password: "password123" }
     * // Returns: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
     * ```
     */
    async login(userDTO) {
        const token = await this.authService.login(userDTO);
        return (0, index_1.CreateLoginResponse)(token);
    }
    /**
     * Registers a new user account.
     *
     * Creates a new user account with the provided credentials.
     * This endpoint is public and does not require authentication.
     *
     * @param {UserDTO} userDTO - User information containing id and password
     * @returns {Promise<void>} No return value on success
     * @throws {UserError} When user already exists or registration fails
     * @example
     * ```typescript
     * // POST /auth/register
     * // Body: { id: "newuser", password: "newpassword123" }
     * ```
     */
    async register(userDTO) {
        await this.authService.register(userDTO);
    }
};
exports.AuthController = AuthController;
tslib_1.__decorate([
    (0, _common_1.Public)(),
    (0, common_1.Post)('login'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof index_1.UserDTO !== "undefined" && index_1.UserDTO) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], AuthController.prototype, "login", null);
tslib_1.__decorate([
    (0, _common_1.Public)(),
    (0, common_1.Post)('register'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_d = typeof index_1.UserDTO !== "undefined" && index_1.UserDTO) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], AuthController.prototype, "register", null);
exports.AuthController = AuthController = tslib_1.__decorate([
    (0, common_1.Controller)('auth'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);


/***/ }),
/* 193 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const jwt_1 = __webpack_require__(188);
const _security_1 = __webpack_require__(185);
const index_1 = __webpack_require__(68);
const _repository_1 = __webpack_require__(10);
const user_error_1 = __webpack_require__(40);
const _common_1 = __webpack_require__(32);
/**
 * Service for handling authentication operations.
 *
 * Provides business logic for user authentication including login validation,
 * JWT token generation, and user registration. All operations are wrapped
 * with error handling decorators.
 *
 * @category Business Services
 * @since 1.0.0
 */
let AuthService = class AuthService {
    constructor(usersRepo, jwt, password) {
        this.usersRepo = usersRepo;
        this.jwt = jwt;
        this.password = password;
    }
    /**
     * Authenticates a user and generates a JWT token.
     *
     * Validates user credentials by checking if the user exists and comparing
     * the provided password with the stored hash. Returns a JWT token on
     * successful authentication.
     *
     * @param {UserDTO} dto - User credentials containing id and password
     * @returns {Promise<string>} JWT token for authenticated requests
     * @throws {UserError} When user is not found or password is incorrect
     * @example
     * ```typescript
     * const token = await authService.login({
     *   id: "user123",
     *   password: "password123"
     * });
     * console.log(token); // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     * ```
     */
    async login(dto) {
        const user = await this.usersRepo.loadUserById(dto.id);
        if (!user) {
            throw user_error_1.UserError.UserNotFound({ userId: dto.id });
        }
        const ok = await this.password.comparePlainAndHash(dto.password, user.password);
        if (!ok) {
            throw user_error_1.UserError.UserNotFound({ userId: dto.id });
        }
        const payload = { sub: user.id };
        const token = await this.jwt.signAsync(payload);
        return token;
    }
    /**
     * Registers a new user account.
     *
     * Creates a new user account with the provided credentials. The password
     * will be hashed before storage for security.
     *
     * @param {UserDTO} dto - User information containing id and password
     * @returns {Promise<void>} No return value on success
     * @throws {UserError} When user already exists or registration fails
     * @example
     * ```typescript
     * await authService.register({
     *   id: "newuser",
     *   password: "newpassword123"
     * });
     * // New user account created
     * ```
     */
    async register(dto) {
        await this.usersRepo.createUser(dto);
    }
};
exports.AuthService = AuthService;
tslib_1.__decorate([
    (0, _common_1.HandleAuthErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_d = typeof index_1.UserDTO !== "undefined" && index_1.UserDTO) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], AuthService.prototype, "login", null);
tslib_1.__decorate([
    (0, _common_1.HandleAuthErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_f = typeof index_1.UserDTO !== "undefined" && index_1.UserDTO) === "function" ? _f : Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AuthService.prototype, "register", null);
exports.AuthService = AuthService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof _repository_1.UserRepositoryService !== "undefined" && _repository_1.UserRepositoryService) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object, typeof (_c = typeof _security_1.PasswordService !== "undefined" && _security_1.PasswordService) === "function" ? _c : Object])
], AuthService);


/***/ }),
/* 194 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BrokerService = exports.BrokerModule = void 0;
// Export module
var broker_module_1 = __webpack_require__(195);
Object.defineProperty(exports, "BrokerModule", ({ enumerable: true, get: function () { return broker_module_1.BrokerModule; } }));
// Export service
var broker_service_1 = __webpack_require__(197);
Object.defineProperty(exports, "BrokerService", ({ enumerable: true, get: function () { return broker_service_1.BrokerService; } }));


/***/ }),
/* 195 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BrokerModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const broker_controller_1 = __webpack_require__(196);
const broker_service_1 = __webpack_require__(197);
const _host_1 = __webpack_require__(202);
const cms_https_client_module_1 = __webpack_require__(274);
/**
 * Module for managing broker-related functionalities.
 * Provides broker control operations including start, stop, restart, and list.
 *
 * 브로커 관련 기능을 관리하기 위한 모듈입니다.
 * 브로커의 시작, 중지, 재시작, 목록 조회 기능을 제공합니다.
 *
 * @category Modules
 * @since 1.0.0
 */
let BrokerModule = class BrokerModule {
};
exports.BrokerModule = BrokerModule;
exports.BrokerModule = BrokerModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [broker_controller_1.BrokerController],
        providers: [broker_service_1.BrokerService],
        imports: [_host_1.HostModule, cms_https_client_module_1.CmsHttpsClientModule],
        exports: [broker_service_1.BrokerService]
    })
], BrokerModule);


/***/ }),
/* 196 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var BrokerController_1;
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BrokerController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const broker_service_1 = __webpack_require__(197);
/**
 * Controller for handling broker-related operations.
 * Provides REST API endpoints for broker management operations including:
 * - Get broker list for a specific host
 * - Stop a broker
 * - Start a broker
 * - Restart a broker
 * - Get broker status
 *
 * 브로커 관련 작업을 처리하기 위한 컨트롤러입니다.
 * 브로커의 시작, 중지, 재시작, 목록 조회, 상태 조회를 위한 REST API 엔드포인트를 제공합니다.
 * - 모든 엔드포인트는 경로 파라미터로 `hostUid`를 받습니다
 * - RESTful 패턴 준수: /:hostUid/broker/{action}/{identifier}
 *
 * @category Controllers
 * @since 1.0.0
 */
let BrokerController = BrokerController_1 = class BrokerController {
    constructor(brokerService) {
        this.brokerService = brokerService;
        this.logger = new common_1.Logger(BrokerController_1.name);
    }
    /**
     * Get list of brokers for a specific host.
     *
     * 특정 호스트의 브로커 목록을 조회합니다.
     *
     * @route GET /:hostUid/broker/list
     * @param req - Request object containing user information
     * @param hostUid - Host unique identifier from path parameter
     * @returns List of brokers
     * @example
     * // POST /host-uid/broker/list
     */
    async getBrokers(req, hostUid) {
        const userId = req.user.sub;
        const response = await this.brokerService.getBrokers(userId, hostUid);
        return response;
    }
    /**
     * Stop a broker.
     *
     * 브로커를 중지합니다.
     *
     * @route POST /:hostUid/broker/stop/:bname
     * @param req - Request object containing user information
     * @param hostUid - Host unique identifier from path parameter
     * @param bname - Broker name from path parameter
     * @returns Response indicating success or failure
     * @example
     * // POST /host-uid/broker/stop/query_editor
     */
    async stopBroker(req, hostUid, bname) {
        const userId = req.user.sub;
        common_1.Logger.log(`Stopping broker: ${bname} on host: ${hostUid}`, 'BrokerController');
        const response = await this.brokerService.stopBroker(userId, hostUid, bname);
        return response;
    }
    /**
     * Start a broker.
     *
     * 브로커를 시작합니다.
     *
     * @route POST /:hostUid/broker/start/:bname
     * @param req - Request object containing user information
     * @param hostUid - Host unique identifier from path parameter
     * @param bname - Broker name from path parameter
     * @returns Response indicating success or failure
     * @example
     * // POST /host-uid/broker/start/query_editor
     */
    async startBroker(req, hostUid, bname) {
        const userId = req.user.sub;
        common_1.Logger.log(`Starting broker: ${bname} on host: ${hostUid}`, 'BrokerController');
        const response = await this.brokerService.startBroker(userId, hostUid, bname);
        return response;
    }
    /**
     * Restart a broker.
     *
     * 브로커를 재시작합니다.
     *
     * @route POST /:hostUid/broker/restart/:bname
     * @param req - Request object containing user information
     * @param hostUid - Host unique identifier from path parameter
     * @param bname - Broker name from path parameter
     * @returns Boolean indicating success
     * @example
     * // POST /host-uid/broker/restart/query_editor
     */
    async restartBroker(req, hostUid, bname) {
        const userId = req.user.sub;
        common_1.Logger.log(`Restarting broker: ${bname} on host: ${hostUid}`, 'BrokerController');
        const response = await this.brokerService.restartBroker(userId, hostUid, bname);
        return response;
    }
    /**
     * Get broker status including application server information.
     *
     * 애플리케이션 서버 정보를 포함한 브로커 상태를 조회합니다.
     *
     * @route GET /:hostUid/broker/status/:bname
     * @param req - Request object containing user information
     * @param hostUid - Host unique identifier from path parameter
     * @param bname - Broker name from path parameter
     * @returns Broker status data without BaseCmsResponse fields
     * @example
     * // POST /host-uid/broker/status/query_editor
     */
    async getBrokerStatus(req, hostUid, bname) {
        const userId = req.user.sub;
        common_1.Logger.log(`Getting broker status: ${bname} on host: ${hostUid}`, 'BrokerController');
        const response = await this.brokerService.getBrokerStatus(userId, hostUid, bname);
        return response;
    }
};
exports.BrokerController = BrokerController;
tslib_1.__decorate([
    (0, common_1.Get)('list'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], BrokerController.prototype, "getBrokers", null);
tslib_1.__decorate([
    (0, common_1.Post)('stop/:bname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('bname')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], BrokerController.prototype, "stopBroker", null);
tslib_1.__decorate([
    (0, common_1.Post)('start/:bname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('bname')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], BrokerController.prototype, "startBroker", null);
tslib_1.__decorate([
    (0, common_1.Post)('restart/:bname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('bname')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], BrokerController.prototype, "restartBroker", null);
tslib_1.__decorate([
    (0, common_1.Get)('status/:bname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('bname')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], BrokerController.prototype, "getBrokerStatus", null);
exports.BrokerController = BrokerController = BrokerController_1 = tslib_1.__decorate([
    (0, common_1.Controller)(':hostUid/broker'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof broker_service_1.BrokerService !== "undefined" && broker_service_1.BrokerService) === "function" ? _a : Object])
], BrokerController);


/***/ }),
/* 197 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BrokerService = void 0;
const tslib_1 = __webpack_require__(3);
const cms_https_client_service_1 = __webpack_require__(198);
const _common_1 = __webpack_require__(32);
const broker_error_1 = __webpack_require__(42);
const _host_1 = __webpack_require__(202);
const common_1 = __webpack_require__(6);
/**
 * Service for managing broker operations.
 *
 * Provides high-level business logic for broker-related operations
 * including message handling and service coordination.
 *
 * @category Business Services
 * @since 1.0.0
 */
let BrokerService = class BrokerService {
    constructor(hostService, cmsClient) {
        this.hostService = hostService;
        this.cmsClient = cmsClient;
    }
    async getBrokers(userId, hostUid) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body = {
            task: "getbrokersinfo",
            token: host.token ? host.token : ""
        };
        const response = await this.cmsClient.postAuthenticated(url, body);
        (0, _common_1.checkCmsTokenError)(response);
        if (response.status !== 'success') {
            throw broker_error_1.BrokerError.GetBrokersFailed();
        }
        return response.brokersinfo;
    }
    async stopBroker(userId, hostUid, bname) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body = {
            task: "broker_stop",
            token: host.token ? host.token : "",
            bname: bname
        };
        const response = await this.cmsClient.postAuthenticated(url, body);
        (0, _common_1.checkCmsTokenError)(response);
        if (response.status !== 'success') {
            throw broker_error_1.BrokerError.BrokerStopFailed();
        }
        return response;
    }
    async startBroker(userId, hostUid, bname) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body = {
            task: "broker_start",
            token: host.token ? host.token : "",
            bname: bname
        };
        const response = await this.cmsClient.postAuthenticated(url, body);
        (0, _common_1.checkCmsTokenError)(response);
        if (response.status !== 'success') {
            throw broker_error_1.BrokerError.BrokerStartFailed();
        }
        return response;
    }
    async restartBroker(userId, hostUid, bname) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const stopRequest = {
            task: "broker_stop",
            token: host.token ? host.token : "",
            bname: bname
        };
        const response = await this.cmsClient.postAuthenticated(url, stopRequest);
        if (response.status === "success") {
            const startRequest = {
                task: "broker_start",
                token: host.token ? host.token : "",
                bname: bname
            };
            const response = await this.cmsClient.postAuthenticated(url, startRequest);
            if (response.status === "success") {
                return true;
            }
            else {
                throw broker_error_1.BrokerError.BrokerStartFailed();
            }
        }
        else {
            throw broker_error_1.BrokerError.BrokerStopFailed();
        }
    }
    /**
     * Get broker status including application server information.
     *
     * 애플리케이션 서버 정보를 포함한 브로커 상태를 조회합니다.
     *
     * @param userId - User ID
     * @param hostUid - Host unique identifier
     * @param bname - Broker name
     * @returns Broker status data without BaseCmsResponse fields
     * @throws BrokerError if the request fails
     */
    async getBrokerStatus(userId, hostUid, bname) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body = {
            task: "getbrokerstatus",
            token: host.token ? host.token : "",
            bname: bname
        };
        const response = await this.cmsClient.postAuthenticated(url, body);
        (0, _common_1.checkCmsTokenError)(response);
        if (response.status === "success") {
            const { __EXEC_TIME, note, status, task, ...dataOnly } = response;
            return dataOnly;
        }
        throw broker_error_1.BrokerError.GetBrokersFailed({ response });
    }
    async stopAllBrokers(userId, hostUid) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body = {
            task: "stopbroker",
            token: host.token ? host.token : "",
        };
        const response = await this.cmsClient.postAuthenticated(url, body);
        (0, _common_1.checkCmsTokenError)(response);
        if (response.status === "success") {
            return true;
        }
        throw broker_error_1.BrokerError.BrokerStopFailed();
    }
    async startAllBrokers(userId, hostUid) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body = {
            task: "startbroker",
            token: host.token ? host.token : "",
        };
        const response = await this.cmsClient.postAuthenticated(url, body);
        (0, _common_1.checkCmsTokenError)(response);
        if (response.status === "success") {
            return true;
        }
        throw broker_error_1.BrokerError.BrokerStartFailed();
    }
};
exports.BrokerService = BrokerService;
tslib_1.__decorate([
    (0, _common_1.HandleBrokerErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], BrokerService.prototype, "getBrokers", null);
tslib_1.__decorate([
    (0, _common_1.HandleBrokerErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], BrokerService.prototype, "stopBroker", null);
tslib_1.__decorate([
    (0, _common_1.HandleBrokerErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], BrokerService.prototype, "startBroker", null);
tslib_1.__decorate([
    (0, _common_1.HandleBrokerErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], BrokerService.prototype, "restartBroker", null);
tslib_1.__decorate([
    (0, _common_1.HandleBrokerErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], BrokerService.prototype, "getBrokerStatus", null);
tslib_1.__decorate([
    (0, _common_1.HandleBrokerErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], BrokerService.prototype, "stopAllBrokers", null);
tslib_1.__decorate([
    (0, _common_1.HandleBrokerErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], BrokerService.prototype, "startAllBrokers", null);
exports.BrokerService = BrokerService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof _host_1.HostService !== "undefined" && _host_1.HostService) === "function" ? _a : Object, typeof (_b = typeof cms_https_client_service_1.CmsHttpsClientService !== "undefined" && cms_https_client_service_1.CmsHttpsClientService) === "function" ? _b : Object])
], BrokerService);


/***/ }),
/* 198 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CmsHttpsClientService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const axios_1 = __webpack_require__(199);
const rxjs_1 = __webpack_require__(200);
const handle_cms_https_client_errors_decorator_1 = __webpack_require__(56);
const https = tslib_1.__importStar(__webpack_require__(201));
const _host_1 = __webpack_require__(202);
const _security_1 = __webpack_require__(185);
const _common_1 = __webpack_require__(32);
/**
 * Service for handling secure HTTPS client communications with CMS (Central Management System).
 * This service provides methods for making authenticated and unauthenticated requests to CMS APIs,
 * and for forwarding client requests after augmenting them with necessary authentication tokens.
 *
 * CMS (중앙 관리 시스템)와의 보안 HTTPS 클라이언트 통신을 처리하는 서비스입니다.
 * 이 서비스는 CMS API에 대한 인증된 및 비인증된 요청을 수행하고,
 * 필요한 인증 토큰을 추가한 후 클라이언트 요청을 전달하는 메서드를 제공합니다.
 *
 * @category Business Services
 * @since 1.0.0
 */
let CmsHttpsClientService = class CmsHttpsClientService {
    /**
     * @param httpService - The NestJS HttpService for making HTTP requests.
     * @param hostService - Service for retrieving host-related information.
     * @param encryptionService - Service for handling encryption and hashing operations.
     *
     * @param httpService - HTTP 요청을 수행하기 위한 NestJS HttpService.
     * @param hostService - 호스트 관련 정보를 검색하기 위한 서비스.
     * @param encryptionService - 암호화 및 해싱 작업을 처리하기 위한 서비스.
     */
    constructor(httpService, hostService, encryptionService) {
        this.httpService = httpService;
        this.hostService = hostService;
        this.encryptionService = encryptionService;
    }
    /**
     * Sends an unauthenticated POST request to a public CMS API endpoint.
     * This method is suitable for endpoints that do not require a user authentication token.
     * Note: `rejectUnauthorized` is set to `false` for development/testing purposes,
     * which means SSL certificates will not be validated. This should be reviewed for production environments.
     *
     * 공개 CMS API 엔드포인트로 비인증 POST 요청을 보냅니다.
     * 이 메서드는 사용자 인증 토큰이 필요하지 않은 엔드포인트에 적합합니다.
     * 참고: 개발/테스트 목적으로 `rejectUnauthorized`가 `false`로 설정되어 있습니다.
     * 이는 SSL 인증서가 유효성 검사를 통과하지 않음을 의미합니다. 프로덕션 환경에서는 이 설정을 검토해야 합니다.
     *
     * @param url - The target URL of the CMS API endpoint.
     * @param data - The request payload, excluding the authentication token.
     * @returns A Promise that resolves with the response data from the CMS API.
     * @throws CmsError if the request fails or an unexpected error occurs.
     *
     * @param url - CMS API 엔드포인트의 대상 URL.
     * @param data - 인증 토큰을 제외한 요청 페이로드.
     * @returns CMS API의 응답 데이터를 포함하는 Promise.
     * @throws 요청 실패 또는 예기치 않은 오류 발생 시 CmsError.
     */
    async postPublic(url, data) {
        const config = {
            headers: { 'Content-Type': 'application/json' },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };
        common_1.Logger.log({ url, data, config });
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, data, config));
        return response.data;
    }
    /**
     * Sends an authenticated POST request to a CMS API endpoint.
     * This method expects the request data to include an authentication token.
     * Note: `rejectUnauthorized` is set to `false` for development/testing purposes,
     * which means SSL certificates will not be validated. This should be reviewed for production environments.
     *
     * CMS API 엔드포인트로 인증된 POST 요청을 보냅니다.
     * 이 메서드는 요청 데이터에 인증 토큰이 포함될 것으로 예상합니다.
     * 참고: 개발/테스트 목적으로 `rejectUnauthorized`가 `false`로 설정되어 있습니다.
     * 이는 SSL 인증서가 유효성 검사를 통과하지 않음을 의미합니다. 프로덕션 환경에서는 이 설정을 검토해야 합니다.
     *
     * @param url - The target URL of the CMS API endpoint.
     * @param data - The request payload, including the authentication token.
     * @returns A Promise that resolves with the response data from the CMS API.
     * @throws CmsError if the request fails or an unexpected error occurs.
     *
     * @param url - CMS API 엔드포인트의 대상 URL.
     * @param data - 인증 토큰을 포함한 요청 페이로드.
     * @returns CMS API의 응답 데이터를 포함하는 Promise.
     * @throws 요청 실패 또는 예기치 않은 오류 발생 시 CmsError.
     */
    async postAuthenticated(url, data) {
        const config = {
            headers: { 'Content-Type': 'application/json' },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };
        common_1.Logger.log({ url, data, config });
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, data, config));
        return response.data;
    }
    /**
     * Forwards an authenticated client request to a CMS API endpoint.
     * This method retrieves host information, constructs the full CMS API URL,
     * and injects the necessary authentication token into the request body before sending it.
     * The client is not expected to provide the token directly.
     *
     * 인증된 클라이언트 요청을 CMS API 엔드포인트로 전달합니다.
     * 이 메서드는 호스트 정보를 검색하고, 전체 CMS API URL을 구성하며,
     * 필요한 인증 토큰을 요청 본문에 삽입한 후 전송합니다.
     * 클라이언트는 토큰을 직접 제공할 필요가 없습니다.
     *
     * @param sub - The subject (user ID) from the authentication token, used to find the host.
     * @param requestBody - The original request payload from the client, containing hostUid and task.
     * @param shouldSkipStatusCheck - Optional callback to determine if status check should be skipped (for CMS bug workarounds).
     * @returns A Promise that resolves with the response data from the CMS API.
     * @throws HostError.NoSuchHost if the specified host is not found.
     * @throws CmsError if the forwarded request fails or an unexpected error occurs.
     *
     * @param sub - 인증 토큰의 주체(사용자 ID)로, 호스트를 찾는 데 사용됩니다.
     * @param requestBody - hostUid와 task를 포함한 클라이언트의 원본 요청 페이로드.
     * @param shouldSkipStatusCheck - status 체크를 스킵할지 결정하는 선택적 콜백 (CMS 버그 우회용).
     * @returns CMS API의 응답 데이터를 포함하는 Promise.
     * @throws 지정된 호스트를 찾을 수 없는 경우 HostError.NoSuchHost.
     * @throws 전달된 요청이 실패하거나 예기치 않은 오류 발생 시 CmsError.
     */
    async forwardAuthenticated(sub, requestBody, shouldSkipStatusCheck) {
        const hostUid = requestBody.hostUid;
        const host = await this.hostService.findHostInternal(sub, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request = {
            token: host.token || "",
            ...requestBody
        };
        common_1.Logger.log(request);
        const rv = await this.postAuthenticated(url, request);
        (0, _common_1.checkCmsTokenError)(rv);
        const task = requestBody.task;
        const shouldSkip = shouldSkipStatusCheck ? shouldSkipStatusCheck(task, rv) : false;
        if (!shouldSkip) {
            (0, _common_1.checkCmsStatusError)(rv, `CMS request failed: ${rv.note || 'Unknown error'}`);
        }
        return rv;
    }
};
exports.CmsHttpsClientService = CmsHttpsClientService;
tslib_1.__decorate([
    (0, handle_cms_https_client_errors_decorator_1.HandleCmsHttpsClientErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_d = typeof T !== "undefined" && T) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], CmsHttpsClientService.prototype, "postPublic", null);
tslib_1.__decorate([
    (0, handle_cms_https_client_errors_decorator_1.HandleCmsHttpsClientErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_f = typeof T !== "undefined" && T) === "function" ? _f : Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], CmsHttpsClientService.prototype, "postAuthenticated", null);
tslib_1.__decorate([
    (0, handle_cms_https_client_errors_decorator_1.HandleCmsHttpsClientErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_h = typeof T !== "undefined" && T) === "function" ? _h : Object, Function]),
    tslib_1.__metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], CmsHttpsClientService.prototype, "forwardAuthenticated", null);
exports.CmsHttpsClientService = CmsHttpsClientService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, typeof (_b = typeof _host_1.HostService !== "undefined" && _host_1.HostService) === "function" ? _b : Object, typeof (_c = typeof _security_1.EncryptionService !== "undefined" && _security_1.EncryptionService) === "function" ? _c : Object])
], CmsHttpsClientService);


/***/ }),
/* 199 */
/***/ ((module) => {

module.exports = require("@nestjs/axios");

/***/ }),
/* 200 */
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),
/* 201 */
/***/ ((module) => {

module.exports = require("https");

/***/ }),
/* 202 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HostService = exports.HostController = exports.HostModule = void 0;
// Export module
var host_module_1 = __webpack_require__(203);
Object.defineProperty(exports, "HostModule", ({ enumerable: true, get: function () { return host_module_1.HostModule; } }));
// Export controller
var host_controller_1 = __webpack_require__(204);
Object.defineProperty(exports, "HostController", ({ enumerable: true, get: function () { return host_controller_1.HostController; } }));
// Export service
var host_service_1 = __webpack_require__(262);
Object.defineProperty(exports, "HostService", ({ enumerable: true, get: function () { return host_service_1.HostService; } }));


/***/ }),
/* 203 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HostService = exports.HostController = exports.HostModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const host_controller_1 = __webpack_require__(204);
const host_service_1 = __webpack_require__(262);
const _repository_1 = __webpack_require__(10);
const _security_1 = __webpack_require__(185);
const _lock_1 = __webpack_require__(273);
/**
 * Host management module for handling host-related operations.
 * 호스트 관련 작업을 처리하는 호스트 관리 모듈입니다.
 *
 * This module provides host management functionality including host list
 * retrieval, adding new hosts, and host validation. It integrates with
 * the security module for encryption and the lock module for concurrency control.
 *
 * 이 모듈은 호스트 목록 조회, 새 호스트 추가, 호스트 검증을 포함한
 * 호스트 관리 기능을 제공합니다. 암호화를 위한 보안 모듈과 동시성 제어를 위한
 * 락 모듈과 통합됩니다.
 *
 * @category Modules
 * @since 1.0.0
 */
let HostModule = class HostModule {
};
exports.HostModule = HostModule;
exports.HostModule = HostModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [host_controller_1.HostController],
        providers: [host_service_1.HostService],
        imports: [_repository_1.UserRepositoryModule, _security_1.SecurityModule, _lock_1.LockModule],
        exports: [host_service_1.HostService]
    })
], HostModule);
// Export controllers and services for documentation
var host_controller_2 = __webpack_require__(204);
Object.defineProperty(exports, "HostController", ({ enumerable: true, get: function () { return host_controller_2.HostController; } }));
var host_service_2 = __webpack_require__(262);
Object.defineProperty(exports, "HostService", ({ enumerable: true, get: function () { return host_service_2.HostService; } }));


/***/ }),
/* 204 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HostController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const _api_interfaces_1 = __webpack_require__(205);
const host_service_1 = __webpack_require__(262);
/**
 * Controller for managing host-related operations.
 * 호스트 관련 작업을 관리하는 컨트롤러입니다.
 *
 * Handles HTTP requests for host management including adding, updating,
 * retrieving, and deleting hosts. All operations require user authentication.
 *
 * 호스트 추가, 업데이트, 조회, 삭제를 포함한 호스트 관리를 위한
 * HTTP 요청을 처리합니다. 모든 작업은 사용자 인증이 필요합니다.
 * - RESTful 패턴 준수: /host (목록/추가), /host/:hostUid (조회/수정/삭제)
 *
 * @category Controllers
 * @since 1.0.0
 */
let HostController = class HostController {
    constructor(hostService) {
        this.hostService = hostService;
    }
    /**
     * Add a new host to user's host list.
     *
     * @param request - Express request object containing user payload
     * @param hostInfo - Host information without UID
     * @returns Promise<GetHostsResponse> Updated host list without passwords
     */
    async addHost(request, hostInfo) {
        const userId = request.user.sub;
        return { host_list: await this.hostService.addHost(userId, hostInfo) };
    }
    /**
     * Get all hosts for the authenticated user.
     *
     * @param request - Express request object containing user payload
     * @returns Promise<GetHostsResponse> List of hosts without passwords
     */
    async getHosts(request) {
        const userId = request.user.sub;
        return await this.hostService.getHostList(userId);
    }
    /**
     * Get a specific host by UID.
     *
     * @route GET /host/:hostUid
     * @param request - Express request object containing user payload
     * @param hostUid - Host unique identifier from path parameter
     * @returns Promise<HostResponse> Host information without password
     * @example
     * // GET /host/host-uid
     */
    async getHost(request, hostUid) {
        const userId = request.user.sub;
        return await this.hostService.findHost(userId, hostUid);
    }
    /**
     * Update an existing host.
     *
     * @route PUT /host/:hostUid
     * @param request - Express request object containing user payload
     * @param hostUid - Host unique identifier from path parameter
     * @param hostInfo - Updated host information (without hostUid)
     * @returns Promise<GetHostsResponse> Updated host list
     * @example
     * // PUT /host/host-uid
     * // Body: { "name": "new-name", "address": "192.168.1.1", ... }
     */
    async updateHost(request, hostUid, hostInfo) {
        const userId = request.user.sub;
        return { host_list: await this.hostService.updateHost(userId, hostUid, hostInfo) };
    }
    /**
     * Delete a host and return updated host list.
     *
     * @route DELETE /host/:hostUid
     * @param request - Express request object containing user payload
     * @param hostUid - Host unique identifier from path parameter
     * @returns Promise<GetHostsResponse> Updated host list without passwords
     * @example
     * // DELETE /host/host-uid
     */
    async deleteHost(request, hostUid) {
        const userId = request.user.sub;
        return { host_list: await this.hostService.deleteHost(userId, hostUid) };
    }
};
exports.HostController = HostController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_b = typeof _api_interfaces_1.AddHostRequest !== "undefined" && _api_interfaces_1.AddHostRequest) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], HostController.prototype, "addHost", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], HostController.prototype, "getHosts", null);
tslib_1.__decorate([
    (0, common_1.Get)(':hostUid'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], HostController.prototype, "getHost", null);
tslib_1.__decorate([
    (0, common_1.Put)(':hostUid'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, typeof (_f = typeof Omit !== "undefined" && Omit) === "function" ? _f : Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], HostController.prototype, "updateHost", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':hostUid'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], HostController.prototype, "deleteHost", null);
exports.HostController = HostController = tslib_1.__decorate([
    (0, common_1.Controller)('host'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof host_service_1.HostService !== "undefined" && host_service_1.HostService) === "function" ? _a : Object])
], HostController);


/***/ }),
/* 205 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(3);
// Export all request types
tslib_1.__exportStar(__webpack_require__(206), exports);
// Export all response types
tslib_1.__exportStar(__webpack_require__(233), exports);


/***/ }),
/* 206 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(3);
// Request exports
tslib_1.__exportStar(__webpack_require__(207), exports);
tslib_1.__exportStar(__webpack_require__(208), exports);
tslib_1.__exportStar(__webpack_require__(209), exports);
tslib_1.__exportStar(__webpack_require__(210), exports);
tslib_1.__exportStar(__webpack_require__(211), exports);
tslib_1.__exportStar(__webpack_require__(212), exports);
tslib_1.__exportStar(__webpack_require__(213), exports);
tslib_1.__exportStar(__webpack_require__(214), exports);
tslib_1.__exportStar(__webpack_require__(215), exports);
tslib_1.__exportStar(__webpack_require__(216), exports);
tslib_1.__exportStar(__webpack_require__(217), exports);
tslib_1.__exportStar(__webpack_require__(218), exports);
// Client request aliases
tslib_1.__exportStar(__webpack_require__(219), exports);
tslib_1.__exportStar(__webpack_require__(220), exports);
tslib_1.__exportStar(__webpack_require__(221), exports);
tslib_1.__exportStar(__webpack_require__(222), exports);
tslib_1.__exportStar(__webpack_require__(223), exports);
tslib_1.__exportStar(__webpack_require__(224), exports);
tslib_1.__exportStar(__webpack_require__(225), exports);
tslib_1.__exportStar(__webpack_require__(226), exports);
tslib_1.__exportStar(__webpack_require__(227), exports);
tslib_1.__exportStar(__webpack_require__(228), exports);
tslib_1.__exportStar(__webpack_require__(229), exports);
tslib_1.__exportStar(__webpack_require__(230), exports);
tslib_1.__exportStar(__webpack_require__(231), exports);
tslib_1.__exportStar(__webpack_require__(232), exports);


/***/ }),
/* 207 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 208 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 209 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 210 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 211 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 212 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 213 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 214 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 215 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 216 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 217 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 218 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 219 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 220 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 221 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 222 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 223 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 224 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 225 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 226 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 227 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 228 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 229 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 230 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 231 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 232 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 233 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(3);
// Response exports
tslib_1.__exportStar(__webpack_require__(234), exports);
tslib_1.__exportStar(__webpack_require__(235), exports);
tslib_1.__exportStar(__webpack_require__(236), exports);
tslib_1.__exportStar(__webpack_require__(237), exports);
tslib_1.__exportStar(__webpack_require__(238), exports);
tslib_1.__exportStar(__webpack_require__(239), exports);
tslib_1.__exportStar(__webpack_require__(240), exports);
// Client response aliases
tslib_1.__exportStar(__webpack_require__(241), exports);
tslib_1.__exportStar(__webpack_require__(242), exports);
tslib_1.__exportStar(__webpack_require__(243), exports);
tslib_1.__exportStar(__webpack_require__(244), exports);
tslib_1.__exportStar(__webpack_require__(245), exports);
tslib_1.__exportStar(__webpack_require__(246), exports);
tslib_1.__exportStar(__webpack_require__(247), exports);
tslib_1.__exportStar(__webpack_require__(248), exports);
tslib_1.__exportStar(__webpack_require__(249), exports);
tslib_1.__exportStar(__webpack_require__(250), exports);
tslib_1.__exportStar(__webpack_require__(251), exports);
tslib_1.__exportStar(__webpack_require__(252), exports);
tslib_1.__exportStar(__webpack_require__(253), exports);
tslib_1.__exportStar(__webpack_require__(254), exports);
tslib_1.__exportStar(__webpack_require__(255), exports);
tslib_1.__exportStar(__webpack_require__(256), exports);
tslib_1.__exportStar(__webpack_require__(257), exports);
tslib_1.__exportStar(__webpack_require__(258), exports);
tslib_1.__exportStar(__webpack_require__(259), exports);
tslib_1.__exportStar(__webpack_require__(260), exports);
tslib_1.__exportStar(__webpack_require__(261), exports);


/***/ }),
/* 234 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 235 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 236 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 237 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 238 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateLoginResponse = CreateLoginResponse;
/**
 * Factory function to create a login response.
 * 로그인 응답을 생성하는 팩토리 함수입니다.
 *
 * @param token - The JWT token to include in the response / 응답에 포함할 JWT 토큰
 * @returns LoginResponse object containing the token / 토큰을 포함하는 LoginResponse 객체
 * @category Responses
 * @since 1.0.0
 */
function CreateLoginResponse(token) {
    const response = {
        token: token,
    };
    return response;
}


/***/ }),
/* 239 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 240 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 241 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 242 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 243 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 244 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 245 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 246 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 247 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 248 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 249 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 250 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 251 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 252 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 253 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 254 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 255 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 256 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 257 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 258 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 259 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 260 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 261 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 262 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var HostService_1;
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HostService = void 0;
const tslib_1 = __webpack_require__(3);
const _common_1 = __webpack_require__(32);
const index_1 = __webpack_require__(36);
const common_1 = __webpack_require__(6);
const _repository_1 = __webpack_require__(10);
const index_2 = __webpack_require__(68);
const _util_1 = __webpack_require__(263);
const uuid_1 = __webpack_require__(67);
/**
 * Service for managing host-related operations.
 *
 * Provides business logic for host management including retrieving host lists,
 * adding new hosts, and validating host information. Handles host limits
 * and duplicate detection.
 *
 * @category Business Services
 * @since 1.0.0
 */
let HostService = HostService_1 = class HostService {
    constructor(repository) {
        this.repository = repository;
        this.logger = new common_1.Logger(HostService_1.name);
    }
    /**
     * Retrieves the list of hosts for a specific user.
     *
     * Loads user data and returns all associated hosts with password fields
     * removed for security purposes.
     *
     * @param {string} userId - The unique identifier of the user
     * @returns {Promise<GetHostsResponse>} Response containing the list of hosts
     * @throws {UserError} When user is not found
     * @example
     * ```typescript
     * const response = await hostService.getHostList("user123");
     * console.log(response.hosts); // Array of HostInfo objects without passwords
     * ```
     */
    async getHostList(userId) {
        this.logger.log(`Getting host list for user: ${userId}`);
        const user = await this.repository.loadUserById(userId);
        const hosts = user.host_list;
        const hostCount = Object.keys(hosts).length;
        this.logger.log(`Found ${hostCount} hosts for user: ${userId}`);
        return {
            host_list: (0, _util_1.omitHashMap)(hosts, ['password', 'token', 'dbProfiles']),
        };
    }
    /**
     * Adds a new host to the user's host list.
     *
     * Validates host limits (max 50 hosts) and checks for duplicates before
     * adding the new host. Uses atomic update to ensure data consistency.
     *
     * @param {string} userId - The unique identifier of the user
     * @param {AddHostRequest} hostInfo - Host information without UID (will be generated)
     * @returns {Promise<User>} The updated user object with the new host
     * @throws {HostError} When host limit is exceeded or duplicate host is found
     * @throws {UserError} When user is not found
     * @example
     * ```typescript
     * const newHost = await hostService.addHost("user123", {
     *   address: "192.168.1.100",
     *   port: 22,
     *   id: "server1",
     *   password: "encrypted_password"
     * });
     * console.log(newHost.host_list); // Contains the new host with generated UID
     * ```
     */
    async addHost(userId, hostInfo) {
        this.logger.log(`Adding host for user: ${userId}, address: ${hostInfo.address}, port: ${hostInfo.port}, id: ${hostInfo.id}`);
        const updatedUser = await this.repository.atomicUpdateUser(userId, async (user) => {
            if (Object.keys(user.host_list).length >= 50) {
                this.logger.warn(`Host limit exceeded for user: ${userId}, current count: ${Object.keys(user.host_list).length}`);
                throw index_1.HostError.ExceedMaxHosts({
                    'current host count': 50,
                });
            }
            const duplicate = Object.values(user.host_list).find((host) => host.address === hostInfo.address &&
                host.port === hostInfo.port &&
                host.id === hostInfo.id);
            if (duplicate) {
                this.logger.warn(`Duplicate host detected for user: ${userId}, duplicate hostUid: ${duplicate.uid}`);
                throw index_1.HostError.DuplicatedHost({
                    duplicatedHostId: duplicate.uid,
                });
            }
            const newHost = {
                uid: (0, uuid_1.v4)(),
                ...hostInfo,
                dbProfiles: {},
            };
            user.host_list[newHost.uid] = newHost;
            this.logger.log(`Host added successfully for user: ${userId}, hostUid: ${newHost.uid}`);
            return user;
        });
        const rv = (0, _util_1.omitHashMap)(updatedUser.host_list, ['token', 'password', 'dbProfiles']);
        return rv;
    }
    /**
     * Removes a host from the user's host list.
     *
     * @param {string} userId - The unique identifier of the user.
     * @param {string} hostUid - The unique identifier of the host to be removed.
     * @returns {Promise<User>} The updated user object after removing the host.
     * @throws {HostError.NoSuchHost} If no host with the given UID is found.
     * @throws {UserError} When user is not found.
     */
    async removeHost(userId, hostUid) {
        this.logger.log(`Removing host for user: ${userId}, hostUid: ${hostUid}`);
        const updatedUser = await this.repository.atomicUpdateUser(userId, async (user) => {
            if (!user.host_list[hostUid]) {
                this.logger.warn(`Host not found for removal: userId: ${userId}, hostUid: ${hostUid}`);
                throw index_1.HostError.NoSuchHost({ hostUid });
            }
            delete user.host_list[hostUid];
            this.logger.log(`Host removed successfully for user: ${userId}, hostUid: ${hostUid}`);
            return user;
        });
        const rv = (0, _util_1.omitHashMap)(updatedUser.host_list, ['token', 'password', 'dbProfiles']);
        return rv;
    }
    /**
     * Updates an existing host in the user's host list.
     *
     * @param {string} userId - The unique identifier of the user.
     * @param {string} hostUid - The unique identifier of the host to be updated.
     * @param {UpdateHostRequest} hostInfo - The new host information to apply.
     * @returns {Promise<User>} The updated user object with the modified host.
     * @throws {HostError.NoSuchHost} If no host with the given UID is found.
     * @throws {HostError.NoSuchUser}
     * @throws {UserError} When user is not found.
     */
    async updateHost(userId, hostUid, hostInfo) {
        const updateFields = Object.keys(hostInfo).filter(key => hostInfo[key] !== undefined);
        this.logger.log(`Updating host for user: ${userId}, hostUid: ${hostUid}, fields: ${updateFields.join(', ')}`);
        const updatedUser = await this.repository.atomicUpdateUser(userId, async (user) => {
            if (!user.host_list[hostUid]) {
                this.logger.warn(`Host not found for update: userId: ${userId}, hostUid: ${hostUid}`);
                throw index_1.HostError.NoSuchHost({ hostUid });
            }
            const existingHost = user.host_list[hostUid];
            const duplicate = Object.values(user.host_list).find((host) => host.address === hostInfo.address &&
                host.port === hostInfo.port &&
                host.id === hostInfo.id &&
                host.uid != hostUid);
            if (duplicate) {
                this.logger.warn(`Duplicate host detected during update: userId: ${userId}, hostUid: ${hostUid}, duplicate hostUid: ${duplicate.uid}`);
                throw index_1.HostError.DuplicatedHost({
                    duplicatedHostId: duplicate.uid,
                });
            }
            const updatedHost = {
                uid: hostUid,
                id: hostInfo.id ?? existingHost.id,
                address: hostInfo.address ?? existingHost.address,
                port: hostInfo.port ?? existingHost.port,
                password: hostInfo.password ?? existingHost.password,
                alias: hostInfo.alias ?? existingHost.alias,
                token: hostInfo.token ?? existingHost.token,
                dbProfiles: hostInfo.dbProfiles ?? existingHost.dbProfiles ?? {},
            };
            user.host_list[hostUid] = updatedHost;
            this.logger.log(`Host updated successfully for user: ${userId}, hostUid: ${hostUid}`);
            return user;
        });
        const rv = (0, _util_1.omitHashMap)(updatedUser.host_list, ['token', 'password', 'dbProfiles']);
        return rv;
    }
    /**
     * Finds and returns a single host by its UID (internal use with password).
     *
     * This method is used as infrastructure service by other business services.
     * Errors from this method will be converted to domain errors by the calling service's decorators.
     *
     * 다른 비즈니스 서비스에서 인프라 서비스로 사용되는 메서드입니다.
     * 이 메서드의 에러는 호출하는 서비스의 데코레이터에 의해 도메인 에러로 변환됩니다.
     *
     * @param {string} userId - The unique identifier of the user.
     * @param {string} hostUid - The unique identifier of the host to find.
     * @returns {Promise<HostInfo>} The found host object with password.
     * @throws {HostError.NoSuchHost} If no host with the given UID is found.
     * @throws {UserError} When user is not found.
     */
    async findHostInternal(userId, hostUid) {
        this.logger.debug(`Finding host (internal) for user: ${userId}, hostUid: ${hostUid}`);
        const user = await this.repository.loadUserById(userId);
        const host = user.host_list[hostUid];
        if (!host) {
            this.logger.warn(`Host not found (internal): userId: ${userId}, hostUid: ${hostUid}`);
            throw index_1.HostError.NoSuchHost({ hostUid });
        }
        return host;
    }
    /**
     * Finds and returns a single host by its UID (external use without password, token, and dbProfiles).
     *
     * @param {string} userId - The unique identifier of the user.
     * @param {string} hostUid - The unique identifier of the host to find.
     * @returns {Promise<HostResponse>} The found host object without password, token, and dbProfiles.
     * @throws {HostError.NoSuchHost} If no host with the given UID is found.
     * @throws {UserError} When user is not found.
     */
    async findHost(userId, hostUid) {
        this.logger.log(`Finding host for user: ${userId}, hostUid: ${hostUid}`);
        const user = await this.repository.loadUserById(userId);
        const host = user.host_list[hostUid];
        if (!host) {
            this.logger.warn(`Host not found: userId: ${userId}, hostUid: ${hostUid}`);
            throw index_1.HostError.NoSuchHost({ hostUid });
        }
        const { password, token, dbProfiles, ...hostResponse } = host;
        return hostResponse;
    }
    /**
     * Deletes a host and returns updated host list.
     *
     * @param {string} userId - The unique identifier of the user.
     * @param {string} hostUid - The unique identifier of the host to delete.
     * @returns {Promise<SafeHostList>} Updated host list without password, token, and dbProfiles.
     * @throws {HostError.NoSuchHost} If no host with the given UID is found.
     * @throws {UserError} When user is not found.
     */
    async deleteHost(userId, hostUid) {
        this.logger.log(`Deleting host for user: ${userId}, hostUid: ${hostUid}`);
        const updatedUser = await this.repository.atomicUpdateUser(userId, async (user) => {
            if (!user.host_list[hostUid]) {
                this.logger.warn(`Host not found for deletion: userId: ${userId}, hostUid: ${hostUid}`);
                throw index_1.HostError.NoSuchHost({ hostUid });
            }
            delete user.host_list[hostUid];
            this.logger.log(`Host deleted successfully for user: ${userId}, hostUid: ${hostUid}`);
            return user;
        });
        return (0, _util_1.omitHashMap)(updatedUser.host_list, ['password', 'token', 'dbProfiles']);
    }
};
exports.HostService = HostService;
tslib_1.__decorate([
    (0, _common_1.HandleHostErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], HostService.prototype, "getHostList", null);
tslib_1.__decorate([
    (0, _common_1.HandleHostErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_c = typeof index_2.AddHostRequest !== "undefined" && index_2.AddHostRequest) === "function" ? _c : Object]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], HostService.prototype, "addHost", null);
tslib_1.__decorate([
    (0, _common_1.HandleHostErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], HostService.prototype, "removeHost", null);
tslib_1.__decorate([
    (0, _common_1.HandleHostErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, typeof (_f = typeof index_2.UpdateHostRequest !== "undefined" && index_2.UpdateHostRequest) === "function" ? _f : Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], HostService.prototype, "updateHost", null);
tslib_1.__decorate([
    (0, _common_1.HandleHostErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], HostService.prototype, "findHostInternal", null);
tslib_1.__decorate([
    (0, _common_1.HandleHostErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], HostService.prototype, "deleteHost", null);
exports.HostService = HostService = HostService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof _repository_1.UserRepositoryService !== "undefined" && _repository_1.UserRepositoryService) === "function" ? _a : Object])
], HostService);


/***/ }),
/* 263 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSectionParams = exports.getConfigParam = exports.parseConfigParamsBySection = exports.parseConfigParams = exports.validateRequiredFields = exports.ResolvedDBAuth = exports.DBAuthResolver = exports.isValidIPv6 = exports.isValidIPv4 = exports.resolveUserFilePath = exports.getStoragePath = exports.getOrCreateSSLCert = exports.passwordValidityChecker = exports.omitHashMap = exports.omitPasswordHashMap = exports.omitPasswordArray = exports.omitPassword = void 0;
// Export utility functions
var omit_password_1 = __webpack_require__(264);
Object.defineProperty(exports, "omitPassword", ({ enumerable: true, get: function () { return omit_password_1.omitPassword; } }));
Object.defineProperty(exports, "omitPasswordArray", ({ enumerable: true, get: function () { return omit_password_1.omitPasswordArray; } }));
Object.defineProperty(exports, "omitPasswordHashMap", ({ enumerable: true, get: function () { return omit_password_1.omitPasswordHashMap; } }));
Object.defineProperty(exports, "omitHashMap", ({ enumerable: true, get: function () { return omit_password_1.omitHashMap; } }));
var password_validity_checker_1 = __webpack_require__(265);
Object.defineProperty(exports, "passwordValidityChecker", ({ enumerable: true, get: function () { return password_validity_checker_1.passwordValidityChecker; } }));
var ssl_util_1 = __webpack_require__(266);
Object.defineProperty(exports, "getOrCreateSSLCert", ({ enumerable: true, get: function () { return ssl_util_1.getOrCreateSSLCert; } }));
var resolve_storage_path_1 = __webpack_require__(27);
Object.defineProperty(exports, "getStoragePath", ({ enumerable: true, get: function () { return resolve_storage_path_1.getStoragePath; } }));
Object.defineProperty(exports, "resolveUserFilePath", ({ enumerable: true, get: function () { return resolve_storage_path_1.resolveUserFilePath; } }));
var ip_checker_1 = __webpack_require__(269);
Object.defineProperty(exports, "isValidIPv4", ({ enumerable: true, get: function () { return ip_checker_1.isValidIPv4; } }));
Object.defineProperty(exports, "isValidIPv6", ({ enumerable: true, get: function () { return ip_checker_1.isValidIPv6; } }));
var db_auth_resolver_1 = __webpack_require__(270);
Object.defineProperty(exports, "DBAuthResolver", ({ enumerable: true, get: function () { return db_auth_resolver_1.DBAuthResolver; } }));
Object.defineProperty(exports, "ResolvedDBAuth", ({ enumerable: true, get: function () { return db_auth_resolver_1.ResolvedDBAuth; } }));
var validate_required_fields_1 = __webpack_require__(271);
Object.defineProperty(exports, "validateRequiredFields", ({ enumerable: true, get: function () { return validate_required_fields_1.validateRequiredFields; } }));
var parse_config_params_1 = __webpack_require__(272);
Object.defineProperty(exports, "parseConfigParams", ({ enumerable: true, get: function () { return parse_config_params_1.parseConfigParams; } }));
Object.defineProperty(exports, "parseConfigParamsBySection", ({ enumerable: true, get: function () { return parse_config_params_1.parseConfigParamsBySection; } }));
Object.defineProperty(exports, "getConfigParam", ({ enumerable: true, get: function () { return parse_config_params_1.getConfigParam; } }));
Object.defineProperty(exports, "getSectionParams", ({ enumerable: true, get: function () { return parse_config_params_1.getSectionParams; } }));


/***/ }),
/* 264 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.omitPassword = omitPassword;
exports.omitPasswordArray = omitPasswordArray;
exports.omitPasswordHashMap = omitPasswordHashMap;
exports.omitHashMap = omitHashMap;
/**
 * Omits the 'password' property from a single object.
 *
 * 단일 객체에서 'password' 속성을 생략합니다.
 *
 * @param param - The object from which to omit the password.
 * @returns A new object without the 'password' property.
 * @category Utilities
 * @since 1.0.0
 */
function omitPassword(param) {
    const { password, ...rv } = param;
    return rv;
}
/**
 * Omits the 'password' property from each object in an array.
 *
 * 배열의 각 객체에서 'password' 속성을 생략합니다.
 *
 * @param param - The array of objects from which to omit passwords.
 * @returns A new array with objects that do not have the 'password' property.
 * @category Utilities
 * @since 1.0.0
 */
function omitPasswordArray(param) {
    return param.map(({ password, ...rv }) => rv);
}
/**
 * Omits the 'password' property from each value in a HashMap.
 *
 * HashMap의 각 값에서 'password' 속성을 생략합니다.
 *
 * @param hashMap - The HashMap from which to omit passwords.
 * @returns A new HashMap with values that do not have the 'password' property.
 * @category Utilities
 * @since 1.0.0
 */
function omitPasswordHashMap(hashMap) {
    const result = {};
    for (const [key, value] of Object.entries(hashMap)) {
        const { password, ...rv } = value;
        result[key] = rv;
    }
    return result;
}
/**
 * Omits specified keys from each value in a generic HashMap.
 *
 * 제네릭 HashMap의 각 값에서 지정된 키를 생략합니다.
 *
 * @param hashMap - The HashMap from which to omit keys.
 * @param keys - An array of keys to omit.
 * @returns A new HashMap with values that do not have the specified keys.
 * @category Utilities
 * @since 1.0.0
 */
function omitHashMap(hashMap, keys) {
    const result = {};
    for (const [key, value] of Object.entries(hashMap)) {
        const omittedValue = { ...value };
        keys.forEach(keyToOmit => delete omittedValue[keyToOmit]);
        result[key] = omittedValue;
    }
    return result;
}


/***/ }),
/* 265 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.passwordValidityChecker = passwordValidityChecker;
/**
 * Checks the validity of a given password.
 * Currently a placeholder, always returns true.
 * TODO: Implement actual password validity logic, including regex.
 *
 * 주어진 비밀번호의 유효성을 확인합니다.
 * 현재는 플레이스홀더이며 항상 true를 반환합니다.
 * TODO: 정규식을 포함한 실제 비밀번호 유효성 검사 로직을 구현해야 합니다.
 *
 * @param password - The password string to check.
 * @returns Always true for now.
 * @category Utilities
 * @since 1.0.0
 */
function passwordValidityChecker(password) {
    return true;
}


/***/ }),
/* 266 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getOrCreateSSLCert = getOrCreateSSLCert;
const tslib_1 = __webpack_require__(3);
const fs = tslib_1.__importStar(__webpack_require__(267));
const path = tslib_1.__importStar(__webpack_require__(28));
const selfsigned = tslib_1.__importStar(__webpack_require__(268));
/**
 * Retrieves existing SSL certificates or generates new self-signed certificates if they don't exist.
 * Certificates are stored in an 'ssl' directory relative to the executable path (for pkg) or project root.
 *
 * 기존 SSL 인증서를 검색하거나, 존재하지 않는 경우 새 자체 서명 인증서를 생성합니다.
 * 인증서는 실행 파일 경로(pkg의 경우) 또는 프로젝트 루트를 기준으로 'ssl' 디렉토리에 저장됩니다.
 *
 * @returns An object containing the SSL key and certificate.
 * @category Utilities
 * @since 1.0.0
 */
function getOrCreateSSLCert() {
    const isPkg = !!process.pkg;
    const baseDir = isPkg
        ? path.dirname(process.execPath)
        : path.resolve(__dirname, '..');
    const sslDir = path.join(baseDir, 'ssl');
    const certPath = path.join(sslDir, 'cert.pem');
    const keyPath = path.join(sslDir, 'key.pem');
    console.log('is running pack : ', isPkg);
    console.log('\t@ baseDir : ', baseDir);
    console.log('\t@ sslDir : ', sslDir);
    console.log('\t@ certPath : ', certPath);
    console.log('\t@ keyPath : ', keyPath);
    const certExtensions = [
        {
            name: 'subjectAltName',
            altNames: [
                { type: 2, value: 'localhost' },
                { type: 7, ip: '127.0.0.1' },
            ],
        },
    ];
    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        if (!fs.existsSync(sslDir))
            fs.mkdirSync(sslDir);
        const pems = selfsigned.generate([{ name: 'commonName', value: 'localhost' }], {
            days: 365,
            algorithm: 'sha256',
            keySize: 2048,
            extensions: certExtensions,
        });
        fs.writeFileSync(certPath, pems.cert);
        fs.writeFileSync(keyPath, pems.private);
        console.log('SSL created');
    }
    return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
    };
}


/***/ }),
/* 267 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 268 */
/***/ ((module) => {

module.exports = require("selfsigned");

/***/ }),
/* 269 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isValidIPv4 = isValidIPv4;
exports.isValidIPv6 = isValidIPv6;
/**
 * Checks if the given string is a valid IPv4 address.
 *
 * 주어진 문자열이 유효한 IPv4 주소인지 확인합니다.
 *
 * @param ip - The string to check.
 * @returns True if the string is a valid IPv4 address, false otherwise.
 * @category Utilities
 * @since 1.0.0
 */
function isValidIPv4(ip) {
    const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    return IPV4_REGEX.test(ip);
}
/**
 * Checks if the given string is a valid IPv6 address.
 *
 * 주어진 문자열이 유효한 IPv6 주소인지 확인합니다.
 *
 * @param ip - The string to check.
 * @returns True if the string is a valid IPv6 address, false otherwise.
 * @category Utilities
 * @since 1.0.0
 */
function isValidIPv6(ip) {
    const IPV6_REGEX = /^(([0-9a-fA-F]{1,4}):){7}([0-9a-fA-F]{1,4})$/;
    return IPV6_REGEX.test(ip);
}


/***/ }),
/* 270 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DBAuthResolver = void 0;
const validation_error_1 = __webpack_require__(46);
/**
 * Utility service for resolving database authentication information.
 *
 * DB 인증 정보를 해결하는 유틸리티 서비스입니다.
 *
 * - Profile이 있는 경우: HostInfo의 dbProfiles에서 id/password를 가져옵니다.
 * - Profile이 없는 경우: 클라이언트에서 제공한 id/password를 사용합니다.
 *
 * @category Utilities
 * @since 1.0.0
 */
class DBAuthResolver {
    /**
     * Resolves database authentication information from host profile or client-provided credentials.
     *
     * 호스트 프로파일 또는 클라이언트 제공 자격 증명으로부터 DB 인증 정보를 해결합니다.
     *
     * @param host - Host information containing dbProfiles
     * @param dbname - Database name
     * @param clientId - Client-provided database user ID (required if profile doesn't exist)
     * @param clientPassword - Client-provided database password (required if profile doesn't exist)
     * @returns ResolvedDBAuth containing dbname, id, and password
     * @throws ValidationError.MissingDBCredentials if profile doesn't exist and client credentials are not provided
     *
     * @example
     * ```typescript
     * // Profile이 있는 경우
     * const auth = DBAuthResolver.resolve(host, 'mydb');
     *
     * // Profile이 없는 경우
     * const auth = DBAuthResolver.resolve(host, 'mydb', 'dbuser', 'dbpass');
     * ```
     */
    static resolve(host, dbname, clientId, clientPassword) {
        const dbProfiles = host.dbProfiles || {};
        const profile = dbProfiles[dbname];
        if (profile) {
            return {
                dbname,
                id: profile.id,
                password: profile.password,
            };
        }
        if (clientId == null || clientPassword == null) {
            const missingFields = [];
            if (clientId == null)
                missingFields.push('id');
            if (clientPassword == null)
                missingFields.push('password');
            throw validation_error_1.ValidationError.MissingDBCredentials(dbname, missingFields);
        }
        return {
            dbname,
            id: clientId,
            password: clientPassword,
        };
    }
    /**
     * Checks if a database profile exists for the given dbname.
     *
     * 주어진 dbname에 대한 데이터베이스 프로파일이 존재하는지 확인합니다.
     *
     * @param host - Host information containing dbProfiles
     * @param dbname - Database name
     * @returns true if profile exists, false otherwise
     */
    static hasProfile(host, dbname) {
        return !!(host.dbProfiles && host.dbProfiles[dbname]);
    }
}
exports.DBAuthResolver = DBAuthResolver;


/***/ }),
/* 271 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateRequiredFields = validateRequiredFields;
const validation_error_1 = __webpack_require__(46);
/**
 * Validates that required fields are present in the request body.
 * Throws ValidationError if any fields are missing.
 *
 * 요청 body에 필수 필드가 있는지 검증합니다.
 * 누락된 필드가 있으면 ValidationError를 던집니다.
 *
 * @param body - Request body object to validate
 * @param fieldNames - Array of required field names to check
 * @param endpoint - Endpoint path for error context (e.g., 'database/start')
 * @param logger - Logger instance (optional, for logging missing fields)
 * @throws ValidationError if any required fields are missing
 *
 * @example
 * ```typescript
 * validateRequiredFields(body, ['hostUid', 'dbname'], 'database/start', Logger);
 * ```
 */
function validateRequiredFields(body, fieldNames, endpoint, logger) {
    if (!body) {
        const missingFields = fieldNames;
        if (logger) {
            logger.error(`Missing required fields: ${missingFields.join(', ')}`, 'Validation');
        }
        throw validation_error_1.ValidationError.MissingRequiredField(missingFields, { endpoint });
    }
    const missingFields = [];
    for (const fieldName of fieldNames) {
        const value = body[fieldName];
        if (value == null) {
            missingFields.push(fieldName);
        }
    }
    if (missingFields.length > 0) {
        if (logger) {
            logger.error(`Missing required fields: ${missingFields.join(', ')}`, 'Validation');
        }
        throw validation_error_1.ValidationError.MissingRequiredField(missingFields, { endpoint });
    }
}


/***/ }),
/* 272 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseConfigParams = parseConfigParams;
exports.parseConfigParamsBySection = parseConfigParamsBySection;
exports.getConfigParam = getConfigParam;
exports.getSectionParams = getSectionParams;
/**
 * Parses configuration file content and extracts system parameters.
 *
 * 설정 파일 내용을 파싱하여 시스템 파라미터를 추출합니다.
 *
 * @param response - CMS response containing configuration data
 * @returns Array of parsed system parameters
 *
 * @example
 * ```typescript
 * const response: GetAllSysParamCmsResponse = { ... };
 * const params = parseConfigParams(response);
 * // Returns: [
 * //   { key: "data_buffer_size", value: "512M", section: "common", lineNumber: 45 },
 * //   { key: "max_clients", value: "100", section: "common", lineNumber: 52 },
 * //   ...
 * // ]
 * ```
 */
function parseConfigParams(response) {
    const params = [];
    let currentSection = '';
    if (!response.conflist || response.conflist.length === 0) {
        return params;
    }
    const confdata = response.conflist[0]?.confdata || [];
    for (let i = 0; i < confdata.length; i++) {
        const line = confdata[i].trim();
        if (!line) {
            continue;
        }
        if (line.startsWith('#')) {
            continue;
        }
        const sectionMatch = line.match(/^\[([^\]]+)\]$/);
        if (sectionMatch) {
            currentSection = sectionMatch[1];
            continue;
        }
        const paramMatch = line.match(/^([^=]+)=(.*)$/);
        if (paramMatch) {
            const key = paramMatch[1].trim();
            const value = paramMatch[2].trim();
            params.push({
                key,
                value,
                section: currentSection,
                lineNumber: i + 1,
            });
        }
    }
    return params;
}
/**
 * Parses configuration file content and groups parameters by section.
 *
 * 설정 파일 내용을 파싱하여 섹션별로 파라미터를 그룹화합니다.
 *
 * @param response - CMS response containing configuration data
 * @returns System parameters grouped by section
 *
 * @example
 * ```typescript
 * const response: GetAllSysParamCmsResponse = { ... };
 * const grouped = parseConfigParamsBySection(response);
 * // Returns: {
 * //   "common": {
 * //     "data_buffer_size": "512M",
 * //     "max_clients": "100",
 * //     ...
 * //   },
 * //   "service": {
 * //     "service": "server,broker,manager",
 * //     ...
 * //   },
 * //   ...
 * // }
 * ```
 */
function parseConfigParamsBySection(response) {
    const grouped = {};
    let currentSection = '';
    if (!response.conflist || response.conflist.length === 0) {
        return grouped;
    }
    const confdata = response.conflist[0]?.confdata || [];
    for (const line of confdata) {
        const trimmed = line.trim();
        if (!trimmed) {
            continue;
        }
        if (trimmed.startsWith('#')) {
            continue;
        }
        const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
        if (sectionMatch) {
            currentSection = sectionMatch[1];
            if (!grouped[currentSection]) {
                grouped[currentSection] = {};
            }
            continue;
        }
        const paramMatch = trimmed.match(/^([^=]+)=(.*)$/);
        if (paramMatch) {
            const key = paramMatch[1].trim();
            const value = paramMatch[2].trim();
            if (currentSection) {
                if (!grouped[currentSection]) {
                    grouped[currentSection] = {};
                }
                grouped[currentSection][key] = value;
            }
        }
    }
    return grouped;
}
/**
 * Gets a specific parameter value from parsed configuration.
 *
 * 파싱된 설정에서 특정 파라미터 값을 가져옵니다.
 *
 * @param grouped - System parameters grouped by section
 * @param section - Section name (optional, searches all sections if not provided)
 * @param key - Parameter key
 * @returns Parameter value or undefined if not found
 *
 * @example
 * ```typescript
 * const grouped = parseConfigParamsBySection(response);
 * const bufferSize = getConfigParam(grouped, "common", "data_buffer_size");
 * // Returns: "512M"
 * ```
 */
function getConfigParam(grouped, section, key) {
    return grouped[section]?.[key];
}
/**
 * Gets all parameters from a specific section.
 *
 * 특정 섹션의 모든 파라미터를 가져옵니다.
 *
 * @param grouped - System parameters grouped by section
 * @param section - Section name
 * @returns Object containing all parameters in the section, or undefined if section not found
 *
 * @example
 * ```typescript
 * const grouped = parseConfigParamsBySection(response);
 * const commonParams = getSectionParams(grouped, "common");
 * // Returns: { data_buffer_size: "512M", max_clients: "100", ... }
 * ```
 */
function getSectionParams(grouped, section) {
    return grouped[section];
}


/***/ }),
/* 273 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LockService = exports.LockModule = void 0;
// Export module
var lock_module_1 = __webpack_require__(65);
Object.defineProperty(exports, "LockModule", ({ enumerable: true, get: function () { return lock_module_1.LockModule; } }));
// Export service
var lock_service_1 = __webpack_require__(30);
Object.defineProperty(exports, "LockService", ({ enumerable: true, get: function () { return lock_service_1.LockService; } }));


/***/ }),
/* 274 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CmsHttpsClientModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const axios_1 = __webpack_require__(199);
const cms_https_client_service_1 = __webpack_require__(198);
const cms_https_client_controller_1 = __webpack_require__(275);
const _host_1 = __webpack_require__(202);
const _security_1 = __webpack_require__(185);
/**
 * Module for handling CMS HTTPS client communications.
 *
 * CMS HTTPS 클라이언트 통신을 처리하기 위한 모듈입니다.
 *
 * @category Modules
 * @since 1.0.0
 */
let CmsHttpsClientModule = class CmsHttpsClientModule {
};
exports.CmsHttpsClientModule = CmsHttpsClientModule;
exports.CmsHttpsClientModule = CmsHttpsClientModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule, _host_1.HostModule, _security_1.SecurityModule],
        exports: [cms_https_client_service_1.CmsHttpsClientService],
        providers: [cms_https_client_service_1.CmsHttpsClientService],
        controllers: [cms_https_client_controller_1.CmsHttpsClientController],
    })
], CmsHttpsClientModule);


/***/ }),
/* 275 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CmsHttpsClientController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const cms_https_client_service_1 = __webpack_require__(198);
/**
 * Controller for handling CMS HTTPS client requests.
 * This controller acts as a proxy to forward authenticated requests to the CMS API.
 *
 * CMS HTTPS 클라이언트 요청을 처리하기 위한 컨트롤러입니다.
 * 이 컨트롤러는 인증된 요청을 CMS API로 전달하는 프록시 역할을 합니다.
 * - 모든 엔드포인트는 경로 파라미터로 `hostUid`를 받습니다
 * - RESTful 패턴 준수: /:hostUid/cms-https-client/{action}
 *
 * @category Controllers
 * @since 1.0.0
 */
let CmsHttpsClientController = class CmsHttpsClientController {
    /**
     * @param clientService - The service responsible for forwarding requests to the CMS API.
     *
     * @param clientService - CMS API로 요청을 전달하는 서비스.
     */
    constructor(clientService) {
        this.clientService = clientService;
    }
    /**
     * Forwards an authenticated request from the client to the CMS API.
     * This endpoint requires JWT authentication. The user's ID is extracted from the JWT,
     * and the host ID is taken from the path parameter. The request body should contain task.
     *
     * 클라이언트로부터의 인증된 요청을 CMS API로 전달합니다.
     * 이 엔드포인트는 JWT 인증을 필요로 합니다. 사용자 ID는 JWT에서 추출되며,
     * 호스트 ID는 경로 파라미터에서 가져옵니다. 요청 본문에는 task가 포함되어야 합니다.
     *
     * @route POST /:hostUid/cms-https-client/forward
     * @param req - The Express request object, containing user information from the JWT.
     * @param hostUid - Host unique identifier from path parameter
     * @param request - The request body from the client, containing task (hostUid is taken from path).
     * @returns A Promise that resolves with the response from the CMS API.
     * @example
     * // POST /host-uid-1/cms-https-client/forward
     * // Body: { "task": "getbrokersinfo" }
     *
     * @param req - JWT에서 사용자 정보를 포함하는 Express 요청 객체.
     * @param hostUid - 경로 파라미터에서 가져온 호스트 고유 식별자
     * @param request - task를 포함한 클라이언트의 요청 본문 (hostUid는 경로에서 가져옴).
     * @returns CMS API의 응답으로 해결되는 Promise.
     */
    async forwardRequest(req, hostUid, request) {
        return this.clientService.forwardAuthenticated(req.user.sub, { ...request, hostUid });
    }
};
exports.CmsHttpsClientController = CmsHttpsClientController;
tslib_1.__decorate([
    (0, common_1.Post)('forward'),
    tslib_1.__param(0, (0, common_1.Req)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, typeof (_b = typeof Omit !== "undefined" && Omit) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], CmsHttpsClientController.prototype, "forwardRequest", null);
exports.CmsHttpsClientController = CmsHttpsClientController = tslib_1.__decorate([
    (0, common_1.Controller)(':hostUid/cms-https-client'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof cms_https_client_service_1.CmsHttpsClientService !== "undefined" && cms_https_client_service_1.CmsHttpsClientService) === "function" ? _a : Object])
], CmsHttpsClientController);


/***/ }),
/* 276 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MonitoringModule = void 0;
// Export module
var monitoring_module_1 = __webpack_require__(277);
Object.defineProperty(exports, "MonitoringModule", ({ enumerable: true, get: function () { return monitoring_module_1.MonitoringModule; } }));


/***/ }),
/* 277 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MonitoringModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const ha_monitoring_controller_1 = __webpack_require__(278);
const ha_monitoring_service_1 = __webpack_require__(279);
const resource_monitoring_controller_1 = __webpack_require__(280);
const resource_monitoring_service_1 = __webpack_require__(281);
const _host_1 = __webpack_require__(202);
const cms_https_client_module_1 = __webpack_require__(274);
/**
 * Module for managing monitoring functionalities.
 * Includes HA (High Availability) and resource monitoring operations.
 *
 * 모니터링 기능을 관리하기 위한 모듈입니다.
 * HA(고가용성) 및 리소스 모니터링 작업을 포함합니다.
 *
 * @category Modules
 * @since 1.0.0
 */
let MonitoringModule = class MonitoringModule {
};
exports.MonitoringModule = MonitoringModule;
exports.MonitoringModule = MonitoringModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [_host_1.HostModule, cms_https_client_module_1.CmsHttpsClientModule],
        controllers: [ha_monitoring_controller_1.HaMonitoringController, resource_monitoring_controller_1.ResourceMonitoringController],
        providers: [ha_monitoring_service_1.HaMonitoringService, resource_monitoring_service_1.ResourceMonitoringService],
        exports: [ha_monitoring_service_1.HaMonitoringService, resource_monitoring_service_1.ResourceMonitoringService],
    })
], MonitoringModule);


/***/ }),
/* 278 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HaMonitoringController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
/**
 * Controller for handling High Availability (HA) monitoring operations.
 * Currently a placeholder.
 *
 * 고가용성(HA) 모니터링 작업을 처리하기 위한 컨트롤러입니다.
 * 현재는 플레이스홀더입니다.
 *
 * @category Controllers
 * @since 1.0.0
 */
let HaMonitoringController = class HaMonitoringController {
};
exports.HaMonitoringController = HaMonitoringController;
exports.HaMonitoringController = HaMonitoringController = tslib_1.__decorate([
    (0, common_1.Controller)('monitoring/:version/ha')
], HaMonitoringController);


/***/ }),
/* 279 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HaMonitoringService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
/**
 * Service for managing High Availability (HA) monitoring operations.
 * Currently a placeholder.
 *
 * 고가용성(HA) 모니터링 작업을 관리하기 위한 서비스입니다.
 * 현재는 플레이스홀더입니다.
 *
 * @category Infrastructure Services
 * @since 1.0.0
 */
let HaMonitoringService = class HaMonitoringService {
};
exports.HaMonitoringService = HaMonitoringService;
exports.HaMonitoringService = HaMonitoringService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], HaMonitoringService);


/***/ }),
/* 280 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResourceMonitoringController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const resource_monitoring_service_1 = __webpack_require__(281);
/**
 * Controller for handling resource monitoring operations.
 *
 * @category Controllers
 * @since 1.0.0
 */
let ResourceMonitoringController = class ResourceMonitoringController {
    constructor(resourceMonitoringService) {
        this.resourceMonitoringService = resourceMonitoringService;
    }
    /**
     * Retrieves raw host statistics (gethoststat) from the CMS API.
     * The client is expected to perform further calculations.
     *
     * @param hostUid The UID of the host.
     * @param req The request object containing user information.
     * @returns A promise that resolves with the raw CmsGetHostStatResponse.
     */
    async getHostStat(hostUid, req) {
        const userId = req.user.sub;
        return await this.resourceMonitoringService.getHostStat(userId, hostUid);
    }
};
exports.ResourceMonitoringController = ResourceMonitoringController;
tslib_1.__decorate([
    (0, common_1.Get)('get-host-stat') // Specific endpoint for get-host-stat
    ,
    tslib_1.__param(0, (0, common_1.Param)('hostUid')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], ResourceMonitoringController.prototype, "getHostStat", null);
exports.ResourceMonitoringController = ResourceMonitoringController = tslib_1.__decorate([
    (0, common_1.Controller)(':hostUid/resource-monitoring') // Base path for this controller
    ,
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof resource_monitoring_service_1.ResourceMonitoringService !== "undefined" && resource_monitoring_service_1.ResourceMonitoringService) === "function" ? _a : Object])
], ResourceMonitoringController);


/***/ }),
/* 281 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResourceMonitoringService = void 0;
const tslib_1 = __webpack_require__(3);
const cms_https_client_service_1 = __webpack_require__(198);
const _common_1 = __webpack_require__(32);
const _host_1 = __webpack_require__(202);
const common_1 = __webpack_require__(6);
/**
 * Service for managing resource monitoring operations.
 * Currently a placeholder.
 *
 * 리소스 모니터링 작업을 관리하기 위한 서비스입니다.
 * 현재는 플레이스홀더입니다.
 *
 * @category Infrastructure Services
 * @since 1.0.0
 */
let ResourceMonitoringService = class ResourceMonitoringService {
    constructor(client, hostService) {
        this.client = client;
        this.hostService = hostService;
    }
    async getHostStat(userId, hostUid) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body = {
            token: host.token || "",
            task: "gethoststat"
        };
        const response = await this.client.postAuthenticated(url, body);
        const { __EXEC_TIME, task, status, note, ...dataOnly } = response;
        return dataOnly;
    }
};
exports.ResourceMonitoringService = ResourceMonitoringService;
tslib_1.__decorate([
    (0, _common_1.HandleResourceMonitoringErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], ResourceMonitoringService.prototype, "getHostStat", null);
exports.ResourceMonitoringService = ResourceMonitoringService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof cms_https_client_service_1.CmsHttpsClientService !== "undefined" && cms_https_client_service_1.CmsHttpsClientService) === "function" ? _a : Object, typeof (_b = typeof _host_1.HostService !== "undefined" && _host_1.HostService) === "function" ? _b : Object])
], ResourceMonitoringService);


/***/ }),
/* 282 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StorageService = exports.StorageModule = void 0;
// Export module
var storage_module_1 = __webpack_require__(17);
Object.defineProperty(exports, "StorageModule", ({ enumerable: true, get: function () { return storage_module_1.StorageModule; } }));
// Export service
var storage_service_1 = __webpack_require__(18);
Object.defineProperty(exports, "StorageService", ({ enumerable: true, get: function () { return storage_service_1.StorageService; } }));


/***/ }),
/* 283 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserService = exports.UserController = exports.UserModule = void 0;
// Export module
var user_module_1 = __webpack_require__(284);
Object.defineProperty(exports, "UserModule", ({ enumerable: true, get: function () { return user_module_1.UserModule; } }));
// Export controller
var user_controller_1 = __webpack_require__(285);
Object.defineProperty(exports, "UserController", ({ enumerable: true, get: function () { return user_controller_1.UserController; } }));
// Export service
var user_service_1 = __webpack_require__(286);
Object.defineProperty(exports, "UserService", ({ enumerable: true, get: function () { return user_service_1.UserService; } }));


/***/ }),
/* 284 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserService = exports.UserController = exports.UserModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const user_controller_1 = __webpack_require__(285);
const _repository_1 = __webpack_require__(10);
const _security_1 = __webpack_require__(185);
const user_service_1 = __webpack_require__(286);
const _token_1 = __webpack_require__(186);
/**
 * User management module for handling user-related operations.
 * 사용자 관련 작업을 처리하기 위한 사용자 관리 모듈입니다.
 *
 * This module provides user management functionality including user data
 * retrieval, password changes, account updates, and user deletion.
 * It integrates with the security module for password operations.
 *
 * 이 모듈은 사용자 데이터 검색, 비밀번호 변경, 계정 업데이트 및 사용자 삭제를 포함한
 * 사용자 관리 기능을 제공합니다. 비밀번호 작업을 위한 보안 모듈과 통합됩니다.
 *
 * @category Modules
 * @since 1.0.0
 */
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [user_controller_1.UserController],
        providers: [user_service_1.UserService],
        imports: [_repository_1.UserRepositoryModule, _security_1.SecurityModule, _token_1.TokenModule],
        exports: [user_service_1.UserService],
    })
], UserModule);
// Export controllers and services for documentation
var user_controller_2 = __webpack_require__(285);
Object.defineProperty(exports, "UserController", ({ enumerable: true, get: function () { return user_controller_2.UserController; } }));
var user_service_2 = __webpack_require__(286);
Object.defineProperty(exports, "UserService", ({ enumerable: true, get: function () { return user_service_2.UserService; } }));


/***/ }),
/* 285 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const user_service_1 = __webpack_require__(286);
const index_1 = __webpack_require__(68);
/**
 * Controller for handling user-related operations.
 *
 * Provides endpoints for user data management including retrieving user information,
 * changing passwords, updating user details, and account deletion.
 * All endpoints require JWT authentication.
 *
 * @category Controllers
 * @since 1.0.0
 */
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    /**
     * Retrieves the current user's data.
     *
     * Returns user information excluding the password field for security.
     * The user ID is extracted from the JWT token in the request.
     *
     * @param {any} req - Express request object containing JWT payload
     * @returns {Promise<UserResponse>} User data without password
     * @throws {UserError} When user is not found
     * @example
     * ```typescript
     * // GET /user
     * // Returns: { uuid: "123", id: "user1", department: "IT", host_list: [], ... }
     * ```
     */
    async getUserData(req) {
        const userId = req.user.sub;
        return await this.userService.getUserData(userId);
    }
    /**
     * Retrieves the current user's preferences.
     *
     * Returns the user's preference object.
     * The user ID is extracted from the JWT token in the request.
     *
     * @param {any} req - Express request object containing JWT payload
     * @returns {Promise<UserPreference>} User preference data
     * @throws {UserError} When user is not found
     * @example
     * ```typescript
     * // GET /user/preferences
     * // Returns: { dashboardInterval: 10, brokerStatusInterval: 20 }
     * ```
     */
    async getUserPreferences(req) {
        const userId = req.user.sub;
        return await this.userService.getUserPreferences(userId);
    }
    /**
     * Changes the user's password.
     *
     * Validates the old password and sets a new password if validation passes.
     * The new password must meet security requirements.
     *
     * @param {ChangePasswordRequest} dto - Password change request containing old and new passwords
     * @param {any} req - Express request object containing JWT payload
     * @returns {Promise<void>} No return value on success
     * @throws {UserError} When old password is incorrect or new password is invalid
     * @example
     * ```typescript
     * // POST /user/credential
     * // Body: { oldPassword: "old123", newPassword: "new456" }
     * ```
     */
    async changePassword(dto, req) {
        const userId = req.user.sub;
        await this.userService.changePassword(userId, dto);
    }
    /**
     * Deletes the user's account.
     *
     * Permanently removes the user account and all associated data.
     * This operation cannot be undone.
     *
     * @param {any} req - Express request object containing JWT payload
     * @returns {Promise<boolean>} Always returns true on successful deletion
     * @throws {UserError} When user is not found
     * @example
     * ```typescript
     * // DELETE /user/account
     * // Returns: true
     * ```
     */
    async deleteUser(req) {
        await this.userService.deleteUser(req.user.sub);
        return true;
    }
    /**
     * Updates user's non-credential information.
     *
     * Updates specific user fields based on the provided request body.
     * Only non-credential fields can be updated (e.g., department, user_preference).
     *
     * @param {any} req - Express request object containing JWT payload
     * @param {UpdateUserDto} body - User information to update
     * @returns {Promise<void>} No return value on success
     * @throws {UserError} When user is not found or update fails
     * @example
     * ```typescript
     * // PATCH /user/profile
     * // Body: { department: "Engineering", user_preference: { dashboardInterval: 30 } }
     * ```
     */
    /**
     * Updates user's preferences.
     *
     * Updates specific user preference fields based on the provided request body.
     *
     * @param {any} req - Express request object containing JWT payload
     * @param {UserPreferenceDto} body - User preferences to update
     * @returns {Promise<void>} No return value on success
     * @throws {UserError} When user is not found or update fails
     * @example
     * ```typescript
     * // PATCH /user/preferences
     * // Body: { dashboardInterval: 30 }
     * ```
     */
    async updateUserPreferences(req, body) {
        const userId = req.user.sub;
        await this.userService.updateUserPreferences(userId, body);
    }
    /**
     * Updates user information.
     *
     * Updates specific user fields based on the provided request body.
     * Only allowed fields can be updated (currently only department).
     *
     * @param {any} req - Express request object containing JWT payload
     * @param {UpdateUserInfoRequest} body - User information to update
     * @returns {Promise<void>} No return value on success
     * @throws {UserError} When user is not found or update fails
     * @example
     * ```typescript
     * // POST /user/account
     * // Body: { department: "Engineering" }
     * ```
     */
    async updateUser(req, body) {
        const userId = req.user.sub;
        await this.userService.updateUser(userId, body);
    }
};
exports.UserController = UserController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], UserController.prototype, "getUserData", null);
tslib_1.__decorate([
    (0, common_1.Get)('preferences'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], UserController.prototype, "getUserPreferences", null);
tslib_1.__decorate([
    (0, common_1.Post)('credential'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_d = typeof index_1.ChangePasswordRequest !== "undefined" && index_1.ChangePasswordRequest) === "function" ? _d : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], UserController.prototype, "changePassword", null);
tslib_1.__decorate([
    (0, common_1.Delete)('account'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], UserController.prototype, "deleteUser", null);
tslib_1.__decorate([
    (0, common_1.Put)('preferences'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_g = typeof index_1.UserPreferenceDto !== "undefined" && index_1.UserPreferenceDto) === "function" ? _g : Object]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], UserController.prototype, "updateUserPreferences", null);
tslib_1.__decorate([
    (0, common_1.Post)('account'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_j = typeof index_1.UpdateUserInfoRequest !== "undefined" && index_1.UpdateUserInfoRequest) === "function" ? _j : Object]),
    tslib_1.__metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], UserController.prototype, "updateUser", null);
exports.UserController = UserController = tslib_1.__decorate([
    (0, common_1.Controller)('user'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _a : Object])
], UserController);


/***/ }),
/* 286 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const _repository_1 = __webpack_require__(10);
const _security_1 = __webpack_require__(185);
const user_error_1 = __webpack_require__(40);
const _util_1 = __webpack_require__(263);
const _common_1 = __webpack_require__(32);
const index_1 = __webpack_require__(68);
/**
 * Service for managing user-related operations.
 *
 * Provides business logic for user data management including password changes,
 * user data retrieval, account deletion, and user information updates.
 * All operations are wrapped with error handling decorators.
 *
 * @category Business Services
 * @since 1.0.0
 */
let UserService = class UserService {
    constructor(repository, password) {
        this.repository = repository;
        this.password = password;
    }
    /**
     * Changes a user's password with validation.
     *
     * Validates the old password against the stored hash and ensures the new password
     * meets security requirements before updating. Uses atomic update to ensure
     * data consistency.
     *
     * @param {string} userId - The unique identifier of the user
     * @param {ChangePasswordRequest} dto - Password change request containing old and new passwords
     * @returns {Promise<void>} No return value on success
     * @throws {UserError} When old password is incorrect or new password is invalid
     * @example
     * ```typescript
     * await userService.changePassword("user123", {
     *   oldPassword: "oldpass123",
     *   newPassword: "newpass456"
     * });
     * ```
     */
    async changePassword(userId, dto) {
        const changePasswordCallback = async (user) => {
            if (await this.password.comparePlainAndHash(dto.oldPassword, user.password)) {
                if (!(0, _util_1.passwordValidityChecker)(dto.newPassword)) {
                    throw user_error_1.UserError.BadNewPassword();
                }
            }
            else {
                throw user_error_1.UserError.OldPasswordMismatch();
            }
            user.password = await this.password.getHashedValue(dto.newPassword);
            return user;
        };
        await this.repository.atomicUpdateUser(userId, changePasswordCallback);
    }
    /**
     * Retrieves user data excluding the password field.
     *
     * Loads user information from the repository and removes the password field
     * for security purposes before returning the data.
     *
     * @param {string} userId - The unique identifier of the user
     * @returns {Promise<UserResponse>} User data without password
     * @throws {UserError} When user is not found
     * @example
     * ```typescript
     * const userData = await userService.getUserData("user123");
     * console.log(userData.department); // "IT"
     * // userData.password is undefined
     * ```
     */
    async getUserData(userId) {
        return (0, _util_1.omitPassword)(await this.repository.loadUserById(userId));
    }
    /**
     * Retrieves user preferences.
     *
     * Loads user information and returns only the `user_preference` object.
     *
     * @param {string} userId - The unique identifier of the user
     * @returns {Promise<UserPreference>} User preferences
     * @throws {UserError} When user is not found
     * @example
     * ```typescript
     * const preferences = await userService.getUserPreferences("user123");
     * console.log(preferences.dashboardInterval); // 10
     * ```
     */
    async getUserPreferences(userId) {
        const user = await this.repository.loadUserById(userId);
        return user.user_preference;
    }
    /**
     * Permanently deletes a user account.
     *
     * Removes the user and all associated data from the repository.
     * This operation cannot be undone.
     *
     * @param {string} userId - The unique identifier of the user to delete
     * @returns {Promise<void>} No return value on success
     * @throws {UserError} When user is not found
     * @example
     * ```typescript
     * await userService.deleteUser("user123");
     * // User account is permanently deleted
     * ```
     */
    async deleteUser(userId) {
        await this.repository.deleteUser(userId);
    }
    /**
     * Updates user's non-credential information with provided data.
     *
     * Updates specific user fields based on the provided update object.
     * This method supports nested updates for `user_preference`.
     * Uses atomic update to ensure data consistency.
     *
     * @param {string} userId - The unique identifier of the user
     * @param {UpdateUserDto} update - Object containing fields to update
     * @returns {Promise<User>} The updated user object
     * @throws {UserError} When user is not found or update fails
     * @example
     * ```typescript
     * const updatedUser = await userService.updateProfile("user123", {
     *   department: "Engineering",
     *   user_preference: { dashboardInterval: 30 }
     * });
     * console.log(updatedUser.department); // "Engineering"
     * console.log(updatedUser.user_preference.dashboardInterval); // 30
     * ```
     */
    async updateProfile(userId, update) {
        return await this.repository.atomicUpdateUser(userId, async (user) => {
            if (update.department) {
                user.department = update.department;
            }
            if (update.user_preference) {
                user.user_preference = {
                    ...user.user_preference,
                    ...update.user_preference,
                };
            }
            return user;
        });
    }
    /**
     * Updates user's preferences with provided data.
     *
     * Updates specific user preference fields based on the provided update object.
     * Uses atomic update to ensure data consistency.
     *
     * @param {string} userId - The unique identifier of the user
     * @param {UserPreferenceDto} update - Object containing preference fields to update
     * @returns {Promise<User>} The updated user object
     * @throws {UserError} When user is not found or update fails
     * @example
     * ```typescript
     * const updatedUser = await userService.updateUserPreferences("user123", {
     *   dashboardInterval: 30
     * });
     * console.log(updatedUser.user_preference.dashboardInterval); // 30
     * ```
     */
    async updateUserPreferences(userId, update) {
        return await this.repository.atomicUpdateUser(userId, async (user) => {
            user.user_preference = {
                ...user.user_preference,
                ...update,
            };
            return user;
        });
    }
    /**
     * Updates user information with provided data.
     *
     * Updates specific user fields based on the provided update object.
     * Uses atomic update to ensure data consistency. Only fields present
     * in the update object will be modified.
     *
     * @param {string} userId - The unique identifier of the user
     * @param {UpdateUserInfoRequest} update - Object containing fields to update
     * @returns {Promise<User>} The updated user object
     * @throws {UserError} When user is not found or update fails
     * @example
     * ```typescript
     * const updatedUser = await userService.updateUser("user123", {
     *   department: "Engineering"
     * });
     * console.log(updatedUser.department); // "Engineering"
     * ```
     */
    async updateUser(userId, update) {
        return await this.repository.atomicUpdateUser(userId, async (user) => {
            Object.entries(update).forEach(([key, value]) => {
                user[key] = value;
            });
            return user;
        });
    }
};
exports.UserService = UserService;
tslib_1.__decorate([
    (0, _common_1.HandleUserErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_c = typeof index_1.ChangePasswordRequest !== "undefined" && index_1.ChangePasswordRequest) === "function" ? _c : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UserService.prototype, "changePassword", null);
tslib_1.__decorate([
    (0, _common_1.HandleUserErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], UserService.prototype, "getUserData", null);
tslib_1.__decorate([
    (0, _common_1.HandleUserErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], UserService.prototype, "getUserPreferences", null);
tslib_1.__decorate([
    (0, _common_1.HandleUserErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], UserService.prototype, "deleteUser", null);
tslib_1.__decorate([
    (0, _common_1.HandleUserErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_g = typeof index_1.UpdateUserDto !== "undefined" && index_1.UpdateUserDto) === "function" ? _g : Object]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], UserService.prototype, "updateProfile", null);
tslib_1.__decorate([
    (0, _common_1.HandleUserErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_j = typeof index_1.UserPreferenceDto !== "undefined" && index_1.UserPreferenceDto) === "function" ? _j : Object]),
    tslib_1.__metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], UserService.prototype, "updateUserPreferences", null);
tslib_1.__decorate([
    (0, _common_1.HandleUserErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_l = typeof index_1.UpdateUserInfoRequest !== "undefined" && index_1.UpdateUserInfoRequest) === "function" ? _l : Object]),
    tslib_1.__metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], UserService.prototype, "updateUser", null);
exports.UserService = UserService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof _repository_1.UserRepositoryService !== "undefined" && _repository_1.UserRepositoryService) === "function" ? _a : Object, typeof (_b = typeof _security_1.PasswordService !== "undefined" && _security_1.PasswordService) === "function" ? _b : Object])
], UserService);


/***/ }),
/* 287 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const app_service_1 = __webpack_require__(288);
/**
 * Root controller for handling basic application endpoints.
 *
 * Provides simple health check and basic API endpoints for the WebCA server.
 * These endpoints are typically used for monitoring and basic connectivity tests.
 *
 * @category Controllers
 * @since 1.0.0
 */
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    /**
     * Handles GET requests to the root endpoint.
     *
     * Returns a simple string response indicating the server is running
     * and responding to GET requests.
     *
     * @returns {string} A confirmation message for GET requests
     * @example
     * ```typescript
     * // GET /
     * // Returns: "GET / "
     * ```
     */
    getHello() {
        return 'GET / ';
    }
    /**
     * Handles POST requests to the root endpoint.
     *
     * Returns a simple string response indicating the server is running
     * and responding to POST requests.
     *
     * @returns {string} A confirmation message for POST requests
     * @example
     * ```typescript
     * // POST /
     * // Returns: "POST /"
     * ```
     */
    postNothing() {
        return 'POST /';
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", String)
], AppController.prototype, "postNothing", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 288 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
/**
 * Root application service providing basic application functionality.
 *
 * This service contains basic methods that can be used across the application
 * for simple operations and health checks.
 *
 * @category Business Services
 * @since 1.0.0
 */
let AppService = class AppService {
    /**
     * Returns a simple greeting message.
     *
     * This method provides a basic "Hello World!" response that can be used
     * for testing and health check purposes.
     *
     * @returns {string} A simple greeting message
     * @example
     * ```typescript
     * const message = appService.getHello();
     * console.log(message); // "Hello World!"
     * ```
     */
    getHello() {
        return 'Hello World!';
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),
/* 289 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CmsAuthModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const cms_auth_service_1 = __webpack_require__(290);
const cms_auth_controller_1 = __webpack_require__(291);
const cms_https_client_module_1 = __webpack_require__(274);
const _repository_1 = __webpack_require__(10);
/**
 * Module for handling CMS authentication functionalities.
 *
 * CMS 인증 기능을 처리하기 위한 모듈입니다.
 *
 * @category Modules
 * @since 1.0.0
 */
let CmsAuthModule = class CmsAuthModule {
};
exports.CmsAuthModule = CmsAuthModule;
exports.CmsAuthModule = CmsAuthModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [cms_https_client_module_1.CmsHttpsClientModule, _repository_1.UserRepositoryModule],
        providers: [cms_auth_service_1.CmsAuthService],
        controllers: [cms_auth_controller_1.CmsAuthController],
        exports: [cms_auth_service_1.CmsAuthService],
    })
], CmsAuthModule);


/***/ }),
/* 290 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CmsAuthService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const cms_https_client_service_1 = __webpack_require__(198);
const _repository_1 = __webpack_require__(10);
const index_1 = __webpack_require__(36);
/**
 * Service for handling authentication with the CMS (Central Management System).
 * This service manages the login process to CMS hosts, including retrieving host credentials,
 * performing the login request, and storing the obtained authentication token.
 *
 * CMS(중앙 관리 시스템)와의 인증을 처리하는 서비스입니다.
 * 이 서비스는 호스트 자격 증명 검색, 로그인 요청 수행 및 획득한 인증 토큰 저장을 포함하여
 * CMS 호스트에 대한 로그인 프로세스를 관리합니다.
 *
 * @category Business Services
 * @since 1.0.0
 */
let CmsAuthService = class CmsAuthService {
    constructor(client, repository) {
        this.client = client;
        this.repository = repository;
    }
    /**
     * Performs a login operation to a specific CMS host for a given user.
     * Retrieves host details, constructs a login request, sends it to the CMS,
     * and stores the received authentication token in the user's host information.
     *
     * 지정된 사용자에 대해 특정 CMS 호스트에 로그인 작업을 수행합니다.
     * 호스트 세부 정보를 검색하고, 로그인 요청을 구성하고, CMS로 전송하고,
     * 수신된 인증 토큰을 사용자 호스트 정보에 저장합니다.
     *
     * @param userId - The ID of the user performing the login.
     * @param uid - The unique identifier of the host to log in to.
     * @returns A Promise that resolves with the authentication token received from the CMS.
     * @throws HostError.NoSuchHost if the specified host is not found for the user.
     */
    async login(userId, uid) {
        const user = await this.repository.loadUserById(userId);
        common_1.Logger.log(uid);
        const host = user.host_list[uid];
        if (!host) {
            throw index_1.HostError.NoSuchHost({ uid: uid });
        }
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request = {
            task: 'login',
            host: host.address,
            port: host.port.toString(),
            id: host.id,
            password: host.password,
            clientver: '11.4',
        };
        const response = await this.client.postPublic(url, request);
        host.token = response.token;
        await this.repository.atomicUpdateUser(userId, async (user) => {
            user.host_list[uid] = host;
            return user;
        });
        return response.token;
    }
    /**
     * Tests a login operation to a CMS host using provided host information.
     * This method is typically used for testing connectivity and credentials without
     * associating the host with a specific user.
     *
     * 제공된 호스트 정보를 사용하여 CMS 호스트에 대한 로그인 작업을 테스트합니다.
     * 이 메서드는 일반적으로 호스트를 특정 사용자와 연결하지 않고
     * 연결 및 자격 증명을 테스트하는 데 사용됩니다.
     *
     * @param host - The host information to use for the login test.
     * @returns A Promise that resolves with the authentication token received from the CMS.
     */
    async testLogin(host) {
        const url = `https://${host.address}:${host.port}/cm_api`;
        const requestData = {
            task: 'login',
            host: host.address,
            port: host.port.toString(),
            id: host.id,
            password: host.password,
            clientver: '13.23',
        };
        const response = await this.client.postPublic(url, requestData);
        return response.token;
    }
};
exports.CmsAuthService = CmsAuthService;
exports.CmsAuthService = CmsAuthService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof cms_https_client_service_1.CmsHttpsClientService !== "undefined" && cms_https_client_service_1.CmsHttpsClientService) === "function" ? _a : Object, typeof (_b = typeof _repository_1.UserRepositoryService !== "undefined" && _repository_1.UserRepositoryService) === "function" ? _b : Object])
], CmsAuthService);


/***/ }),
/* 291 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CmsAuthController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const cms_auth_service_1 = __webpack_require__(290);
/**
 * Controller for handling CMS authentication operations.
 *
 * CMS 인증 작업을 처리하기 위한 컨트롤러입니다.
 * - 모든 엔드포인트는 경로 파라미터로 `hostUid`를 받습니다
 * - RESTful 패턴 준수: /:hostUid/cms-auth/{action}
 *
 * @category Controllers
 * @since 1.0.0
 */
let CmsAuthController = class CmsAuthController {
    constructor(cmsAuthService) {
        this.cmsAuthService = cmsAuthService;
    }
    /**
     * Handles CMS login for a specific host.
     *
     * 특정 호스트에 대한 CMS 로그인을 처리합니다.
     *
     * @route POST /:hostUid/cms-auth/login
     * @param request - The Express request object, containing user information from the JWT.
     * @param hostUid - Host unique identifier from path parameter
     * @returns A boolean indicating successful login.
     * @example
     * // POST /host-uid-1/cms-auth/login
     */
    async login(request, hostUid) {
        const userId = request.user.sub;
        const rv = await this.cmsAuthService.login(userId, hostUid) ? true : false;
        return rv;
    }
};
exports.CmsAuthController = CmsAuthController;
tslib_1.__decorate([
    (0, common_1.Post)('login'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], CmsAuthController.prototype, "login", null);
exports.CmsAuthController = CmsAuthController = tslib_1.__decorate([
    (0, common_1.Controller)(':hostUid/cms-auth'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof cms_auth_service_1.CmsAuthService !== "undefined" && cms_auth_service_1.CmsAuthService) === "function" ? _a : Object])
], CmsAuthController);


/***/ }),
/* 292 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CmsConfigModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const cms_config_controller_1 = __webpack_require__(293);
const cms_config_service_1 = __webpack_require__(294);
const _host_1 = __webpack_require__(202);
const cms_https_client_module_1 = __webpack_require__(274);
/**
 * Module for managing CMS configuration operations.
 *
 * Provides functionality to retrieve environment information from CMS hosts
 * including CUBRID version, broker version, database paths, and system information.
 *
 * CMS 구성 작업을 관리하기 위한 모듈입니다.
 *
 * CUBRID 버전, 브로커 버전, 데이터베이스 경로, 시스템 정보 등
 * CMS 호스트의 환경 정보를 조회하는 기능을 제공합니다.
 *
 * @category Modules
 * @since 1.0.0
 */
let CmsConfigModule = class CmsConfigModule {
};
exports.CmsConfigModule = CmsConfigModule;
exports.CmsConfigModule = CmsConfigModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [_host_1.HostModule, cms_https_client_module_1.CmsHttpsClientModule],
        controllers: [cms_config_controller_1.CmsConfigController],
        providers: [cms_config_service_1.CmsConfigService],
        exports: [cms_config_service_1.CmsConfigService],
    })
], CmsConfigModule);


/***/ }),
/* 293 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var CmsConfigController_1;
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CmsConfigController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const cms_config_service_1 = __webpack_require__(294);
/**
 * Controller for handling CMS environment configuration operations.
 *
 * Provides REST API endpoints for retrieving environment information
 * from CMS hosts including CUBRID version, broker version, database paths, and system information.
 *
 * CMS 환경 구성 작업을 처리하기 위한 컨트롤러입니다.
 *
 * CUBRID 버전, 브로커 버전, 데이터베이스 경로, 시스템 정보 등
 * CMS 호스트의 환경 정보를 조회하는 REST API 엔드포인트를 제공합니다.
 * - 모든 엔드포인트는 경로 파라미터로 `hostUid`를 받습니다
 * - RESTful 패턴 준수: /:hostUid/cms-config/{action}
 *
 * @category Controllers
 * @since 1.0.0
 */
let CmsConfigController = CmsConfigController_1 = class CmsConfigController {
    constructor(cmsConfigService) {
        this.cmsConfigService = cmsConfigService;
        this.logger = new common_1.Logger(CmsConfigController_1.name);
    }
    /**
     * Get environment information from a CMS host.
     * Returns environment variables and system information without CMS envelope fields.
     *
     * CMS 호스트의 환경 정보를 조회합니다.
     * CMS 메타 필드를 제거한 환경 변수 및 시스템 정보를 반환합니다.
     *
     * @route GET /:hostUid/cms-config/env
     * @param req - Express request (contains authenticated user)
     * @param hostUid - Host unique identifier from path parameter
     * @returns GetEnvClientResponse Environment information without CMS envelope fields
     * @example
     * // POST /host-uid/cms-config/env
     */
    async getEnv(req, hostUid) {
        const userId = req.user.sub;
        common_1.Logger.log(`Getting environment info for host: ${hostUid}`, 'CmsConfigController');
        const response = await this.cmsConfigService.getEnv(userId, hostUid);
        return response;
    }
    /**
     * Get database parameters dump from a CMS host.
     * Returns database server parameters without CMS envelope fields.
     *
     * CMS 호스트의 데이터베이스 파라미터 덤프를 조회합니다.
     * CMS 메타 필드를 제거한 데이터베이스 서버 파라미터를 반환합니다.
     *
     * @route GET /:hostUid/cms-config/param-dump
     * @param req - Express request (contains authenticated user)
     * @param hostUid - Host unique identifier from path parameter
     * @param dbname - Database name from query parameter
     * @returns ParamdumpClientResponse Database parameters without CMS envelope fields
     * @example
     * // GET /host-uid/cms-config/param-dump?dbname=demodb
     */
    async paramdump(req, hostUid, dbname) {
        const userId = req.user.sub;
        common_1.Logger.log(`Getting paramdump info for host: ${hostUid}, dbname: ${dbname}`, 'CmsConfigController');
        const response = await this.cmsConfigService.getParamDump(userId, hostUid, dbname);
        return response;
    }
    /**
     * Get database statistics dump from a CMS host.
     * Returns database statistics without CMS envelope fields.
     *
     * CMS 호스트의 데이터베이스 통계 덤프(statdump)를 조회합니다.
     * CMS 메타 필드를 제거한 통계 정보를 반환합니다.
     *
     * @route GET /:hostUid/cms-config/stat-dump/:dbname
     * @param req - Express request (contains authenticated user)
     * @param hostUid - Host unique identifier from path parameter
     * @param dbname - Database name from path parameter
     * @returns StatdumpClientResponse Database statistics without CMS envelope fields
     * @example
     * // GET /host-uid/cms-config/stat-dump/demodb
     */
    async statdump(req, hostUid, dbname) {
        const userId = req.user.sub;
        common_1.Logger.log(`Getting statdump info for host: ${hostUid}, dbname: ${dbname}`, 'CmsConfigController');
        const response = await this.cmsConfigService.getStatDump(userId, hostUid, dbname);
        return response;
    }
    /**
     * Get all system parameters from a configuration file on a CMS host.
     * Returns configuration file content without CMS envelope fields.
     *
     * CMS 호스트의 설정 파일에서 모든 시스템 파라미터를 조회합니다.
     * CMS 메타 필드를 제거한 설정 파일 내용을 반환합니다.
     *
     * @route GET /:hostUid/cms-config/all-sys-param
     * @param req - Express request (contains authenticated user)
     * @param hostUid - Host unique identifier from path parameter
     * @param confname - Configuration file name from query parameter (e.g., "cubridconf")
     * @returns GetAllSysParamClientResponse System parameters without CMS envelope fields
     * @example
     * // GET /host-uid/cms-config/all-sys-param?confname=cubridconf
     */
    async getAllSystemParam(req, hostUid) {
        const userId = req.user.sub;
        const confname = req.query.confname;
        common_1.Logger.log(`Getting all system parameters for host: ${hostUid}, confname: ${confname}`, 'CmsConfigController');
        const response = await this.cmsConfigService.getAllSystemParam(userId, hostUid, confname);
        return response;
    }
    /**
     * Set system parameters in a configuration file on a CMS host.
     * Updates configuration file with provided data.
     *
     * CMS 호스트의 설정 파일에 시스템 파라미터를 설정합니다.
     * 제공된 데이터로 설정 파일을 업데이트합니다.
     *
     * @route POST /:hostUid/cms-config/set-sys-param
     * @param req - Express request (contains authenticated user)
     * @param hostUid - Host unique identifier from path parameter
     * @param body - Request body containing confname and confdata
     * @returns SetSysParamClientResponse Empty object on success (CMS envelope fields removed)
     * @example
     * // POST /host-uid/cms-config/set-sys-param
     * // Body: { "confname": "cubridconf", "confdata": ["# comment", "[section]", "key=value"] }
     */
    async setSystemParam(req, hostUid, body) {
        const userId = req.user.sub;
        common_1.Logger.log(`Setting system parameters for host: ${hostUid}, confname: ${body.confname}`, 'CmsConfigController');
        const response = await this.cmsConfigService.setSystemParam(userId, hostUid, body.confname, body.confdata);
        return response;
    }
};
exports.CmsConfigController = CmsConfigController;
tslib_1.__decorate([
    (0, common_1.Get)('env'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], CmsConfigController.prototype, "getEnv", null);
tslib_1.__decorate([
    (0, common_1.Get)('param-dump/:dbname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('dbname')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], CmsConfigController.prototype, "paramdump", null);
tslib_1.__decorate([
    (0, common_1.Get)('stat-dump/:dbname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('dbname')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], CmsConfigController.prototype, "statdump", null);
tslib_1.__decorate([
    (0, common_1.Get)('all-sys-param'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], CmsConfigController.prototype, "getAllSystemParam", null);
tslib_1.__decorate([
    (0, common_1.Post)('set-sys-param'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], CmsConfigController.prototype, "setSystemParam", null);
exports.CmsConfigController = CmsConfigController = CmsConfigController_1 = tslib_1.__decorate([
    (0, common_1.Controller)(':hostUid/cms-config'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof cms_config_service_1.CmsConfigService !== "undefined" && cms_config_service_1.CmsConfigService) === "function" ? _a : Object])
], CmsConfigController);


/***/ }),
/* 294 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CmsConfigService = void 0;
const tslib_1 = __webpack_require__(3);
const _host_1 = __webpack_require__(202);
const common_1 = __webpack_require__(6);
const cms_https_client_service_1 = __webpack_require__(198);
const _common_1 = __webpack_require__(32);
/**
 * Service for managing CMS environment configuration operations.
 *
 * Provides methods to retrieve environment information from CMS hosts
 * including CUBRID version, broker version, database paths, and system information.
 *
 * CMS 환경 구성 작업을 관리하는 서비스입니다.
 *
 * CUBRID 버전, 브로커 버전, 데이터베이스 경로, 시스템 정보 등
 * CMS 호스트의 환경 정보를 조회하는 메서드를 제공합니다.
 *
 * @category Business Services
 * @since 1.0.0
 */
let CmsConfigService = class CmsConfigService {
    constructor(hostService, cmsClient) {
        this.hostService = hostService;
        this.cmsClient = cmsClient;
    }
    /**
     * Get environment information from a CMS host.
     * Returns domain-only data (CMS envelope removed).
     *
     * CMS 호스트의 환경 정보를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId - User ID from JWT
     * @param hostUid - Host unique identifier
     * @returns GetEnvClientResponse Environment information without CMS envelope fields
     * @throws Error if the request fails or CMS status is not success
     */
    async getEnv(userId, hostUid) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body = {
            task: 'getenv',
            token: host.token || '',
        };
        const response = await this.cmsClient.postAuthenticated(url, body);
        (0, _common_1.checkCmsTokenError)(response);
        if (response.status === 'success') {
            const { __EXEC_TIME, note, status, task, ...dataOnly } = response;
            return dataOnly;
        }
        (0, _common_1.checkCmsStatusError)(response, `Failed to get environment info: ${response.note || 'Unknown error'}`);
        throw new Error(`Failed to get environment info: ${response.note || 'Unknown error'}`);
    }
    /**
     * Get database parameters dump from a CMS host.
     * Returns domain-only data (CMS envelope removed).
     *
     * CMS 호스트의 데이터베이스 파라미터 덤프를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId - User ID from JWT
     * @param hostUid - Host unique identifier
     * @param dbname - Database name
     * @returns ParamdumpClientResponse Database parameters without CMS envelope fields
     * @throws Error if the request fails or CMS status is not success
     */
    async getParamDump(userId, hostUid, dbname) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request = {
            task: 'paramdump',
            token: host.token || '',
            both: 'n',
            dbname: dbname,
        };
        const response = await this.cmsClient.postAuthenticated(url, request);
        (0, _common_1.checkCmsTokenError)(response);
        if (response.status === 'success') {
            const { __EXEC_TIME, note, status, task, ...dataOnly } = response;
            return dataOnly;
        }
        (0, _common_1.checkCmsStatusError)(response, `Failed to get paramdump: ${response.note || 'Unknown error'}`);
        throw new Error(`Failed to get paramdump: ${response.note || 'Unknown error'}`);
    }
    /**
     * Get database statistics dump from a CMS host.
     * Returns domain-only data (CMS envelope removed).
     *
     * CMS 호스트의 데이터베이스 통계 덤프(statdump)를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId - User ID from JWT
     * @param hostUid - Host unique identifier
     * @param dbname - Database name
     * @returns StatdumpClientResponse Database statistics without CMS envelope fields
     * @throws Error if the request fails or CMS status is not success
     */
    async getStatDump(userId, hostUid, dbname) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request = {
            task: 'statdump',
            token: host.token || '',
            dbname,
        };
        const response = await this.cmsClient.postAuthenticated(url, request);
        (0, _common_1.checkCmsTokenError)(response);
        if (response.status === 'success') {
            const { __EXEC_TIME, note, status, task, ...dataOnly } = response;
            return dataOnly;
        }
        (0, _common_1.checkCmsStatusError)(response, `Failed to get statdump: ${response.note || 'Unknown error'}`);
        throw new Error(`Failed to get statdump: ${response.note || 'Unknown error'}`);
    }
    /**
     * Get all system parameters from a configuration file on a CMS host.
     * Returns domain-only data (CMS envelope removed).
     *
     * CMS 호스트의 설정 파일에서 모든 시스템 파라미터를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId - User ID from JWT
     * @param hostUid - Host unique identifier
     * @param confname - Configuration file name (e.g., "cubridconf", "broker.conf")
     * @returns GetAllSysParamClientResponse System parameters without CMS envelope fields
     * @throws Error if the request fails or CMS status is not success
     */
    async getAllSystemParam(userId, hostUid, confname) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request = {
            task: 'getallsysparam',
            token: host.token || '',
            confname: confname,
        };
        const response = await this.cmsClient.postAuthenticated(url, request);
        (0, _common_1.checkCmsTokenError)(response);
        if (response.status === 'success') {
            const { __EXEC_TIME, note, status, task, ...dataOnly } = response;
            return dataOnly;
        }
        (0, _common_1.checkCmsStatusError)(response, `Failed to get all system parameters: ${response.note || 'Unknown error'}`);
        throw new Error(`Failed to get all system parameters: ${response.note || 'Unknown error'}`);
    }
    /**
     * Set system parameters in a configuration file on a CMS host.
     * Returns domain-only data (CMS envelope removed).
     *
     * CMS 호스트의 설정 파일에 시스템 파라미터를 설정합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId - User ID from JWT
     * @param hostUid - Host unique identifier
     * @param confname - Configuration file name (e.g., "cubridconf", "broker.conf")
     * @param confdata - Configuration data as array of lines
     * @returns SetSysParamClientResponse Empty object on success (CMS envelope fields removed)
     * @throws Error if the request fails or CMS status is not success
     */
    async setSystemParam(userId, hostUid, confname, confdata) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request = {
            task: 'setsysparam',
            token: host.token || '',
            confname: confname,
            confdata: confdata,
        };
        const response = await this.cmsClient.postAuthenticated(url, request);
        (0, _common_1.checkCmsTokenError)(response);
        if (response.status === 'success') {
            return {};
        }
        (0, _common_1.checkCmsStatusError)(response, `Failed to set system parameters: ${response.note || 'Unknown error'}`);
        throw new Error(`Failed to set system parameters: ${response.note || 'Unknown error'}`);
    }
};
exports.CmsConfigService = CmsConfigService;
tslib_1.__decorate([
    (0, _common_1.HandleCmsConfigErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], CmsConfigService.prototype, "getEnv", null);
tslib_1.__decorate([
    (0, _common_1.HandleCmsConfigErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], CmsConfigService.prototype, "getParamDump", null);
tslib_1.__decorate([
    (0, _common_1.HandleCmsConfigErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], CmsConfigService.prototype, "getStatDump", null);
tslib_1.__decorate([
    (0, _common_1.HandleCmsConfigErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], CmsConfigService.prototype, "getAllSystemParam", null);
tslib_1.__decorate([
    (0, _common_1.HandleCmsConfigErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, Array]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], CmsConfigService.prototype, "setSystemParam", null);
exports.CmsConfigService = CmsConfigService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof _host_1.HostService !== "undefined" && _host_1.HostService) === "function" ? _a : Object, typeof (_b = typeof cms_https_client_service_1.CmsHttpsClientService !== "undefined" && cms_https_client_service_1.CmsHttpsClientService) === "function" ? _b : Object])
], CmsConfigService);


/***/ }),
/* 295 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const file_service_1 = __webpack_require__(296);
const file_controller_1 = __webpack_require__(297);
const cms_https_client_module_1 = __webpack_require__(274);
const cms_auth_module_1 = __webpack_require__(289);
const _repository_1 = __webpack_require__(10);
/**
 * Module for managing file operations.
 *
 * 파일 작업을 관리하기 위한 모듈입니다.
 *
 * @category Modules
 * @since 1.0.0
 */
let FileModule = class FileModule {
};
exports.FileModule = FileModule;
exports.FileModule = FileModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [cms_https_client_module_1.CmsHttpsClientModule, cms_auth_module_1.CmsAuthModule, _repository_1.UserRepositoryModule],
        providers: [file_service_1.FileService],
        controllers: [file_controller_1.FileController],
        exports: [file_service_1.FileService],
    })
], FileModule);


/***/ }),
/* 296 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const cms_https_client_service_1 = __webpack_require__(198);
const cms_auth_service_1 = __webpack_require__(290);
const _repository_1 = __webpack_require__(10);
const index_1 = __webpack_require__(36);
const handle_cms_https_client_errors_decorator_1 = __webpack_require__(56);
const cms_error_1 = __webpack_require__(45);
const _common_1 = __webpack_require__(32);
/**
 * Service for file operations.
 * 파일 작업을 위한 서비스입니다.
 *
 * Provides business logic for file management operations including
 * file checking, uploading, downloading, and listing.
 *
 * 파일 검사, 업로드, 다운로드, 목록 조회를 포함한 파일 관리 작업을 위한
 * 비즈니스 로직을 제공합니다.
 *
 * @category Business Services
 * @since 1.0.0
 */
let FileService = class FileService {
    constructor(cmsHttpsClient, cmsAuthService, userRepository) {
        this.cmsHttpsClient = cmsHttpsClient;
        this.cmsAuthService = cmsAuthService;
        this.userRepository = userRepository;
    }
    /**
     * Checks if a file exists on the specified CMS host.
     * 지정된 CMS 호스트에서 파일이 존재하는지 확인합니다.
     *
     * @param {string} userId - The unique identifier of the user
     * @param {string} hostUid - The unique identifier of the host
     * @returns {Promise<CheckFileCmsResponse>} Response containing file check information
     * @throws {HostError.NoSuchHost} If no host with the given UID is found
     * @example
     * ```typescript
     * const response = await fileService.checkFile("user123", "host456");
     * console.log(response.status); // "success" or error status
     * ```
     */
    async checkFile(userId, hostUid) {
        const user = await this.userRepository.loadUserById(userId);
        const host = user.host_list[hostUid];
        if (!host) {
            throw index_1.HostError.NoSuchHost({ hostUid });
        }
        if (host.token) {
            try {
                const authUrl = `https://${host.address}:${host.port}/cm_api`;
                const checkFileRequest = {
                    task: 'checkfile',
                    token: host.token,
                };
                const response = await this.cmsHttpsClient.postAuthenticated(authUrl, checkFileRequest);
                (0, _common_1.checkCmsTokenError)(response);
                (0, _common_1.checkCmsStatusError)(response, `Failed to check file: ${response.note || 'Unknown error'}`);
                return response;
            }
            catch (error) {
                common_1.Logger.warn(`Token invalid for host ${hostUid}:`, error.message);
                host.token = undefined;
                await this.userRepository.updateUser(userId, user);
                throw cms_error_1.CmsError.InvalidToken();
            }
        }
        throw cms_error_1.CmsError.InvalidToken();
    }
};
exports.FileService = FileService;
tslib_1.__decorate([
    (0, handle_cms_https_client_errors_decorator_1.HandleCmsHttpsClientErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], FileService.prototype, "checkFile", null);
exports.FileService = FileService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof cms_https_client_service_1.CmsHttpsClientService !== "undefined" && cms_https_client_service_1.CmsHttpsClientService) === "function" ? _a : Object, typeof (_b = typeof cms_auth_service_1.CmsAuthService !== "undefined" && cms_auth_service_1.CmsAuthService) === "function" ? _b : Object, typeof (_c = typeof _repository_1.UserRepositoryService !== "undefined" && _repository_1.UserRepositoryService) === "function" ? _c : Object])
], FileService);


/***/ }),
/* 297 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const file_service_1 = __webpack_require__(296);
/**
 * Controller for file operations.
 * 파일 작업을 관리하는 컨트롤러입니다.
 *
 * Handles HTTP requests for file management including checking file existence,
 * uploading, downloading, and listing files on CMS hosts.
 *
 * CMS 호스트에서 파일 존재 확인, 업로드, 다운로드, 목록 조회를 포함한
 * 파일 관리를 위한 HTTP 요청을 처리합니다.
 * - 모든 엔드포인트는 경로 파라미터로 `hostUid`를 받습니다
 * - RESTful 패턴 준수: /:hostUid/file/{action}
 *
 * @category Controllers
 * @since 1.0.0
 */
let FileController = class FileController {
    constructor(fileService) {
        this.fileService = fileService;
    }
    /**
     * Check if a file exists on the specified CMS host.
     * 지정된 CMS 호스트에서 파일이 존재하는지 확인합니다.
     *
     * @route GET /:hostUid/file/checkfile
     * @param request - Express request object containing user payload
     * @param hostUid - Host unique identifier from path parameter
     * @returns Promise<CheckFileClientResponse> File check information
     * @example
     * // POST /host-uid/file/checkfile
     */
    async checkFile(request, hostUid) {
        const userId = request.user.sub;
        return await this.fileService.checkFile(userId, hostUid);
    }
};
exports.FileController = FileController;
tslib_1.__decorate([
    (0, common_1.Get)('checkfile'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], FileController.prototype, "checkFile", null);
exports.FileController = FileController = tslib_1.__decorate([
    (0, common_1.Controller)(':hostUid/file'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof file_service_1.FileService !== "undefined" && file_service_1.FileService) === "function" ? _a : Object])
], FileController);


/***/ }),
/* 298 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const database_controller_1 = __webpack_require__(299);
const database_service_1 = __webpack_require__(300);
const _host_1 = __webpack_require__(202);
const cms_https_client_module_1 = __webpack_require__(274);
const _repository_1 = __webpack_require__(10);
const database_user_controller_1 = __webpack_require__(301);
const database_user_service_1 = __webpack_require__(302);
/**
 * Module for managing database functionalities.
 * Provides database start information and management operations.
 *
 * 데이터베이스 기능을 관리하기 위한 모듈입니다.
 * 데이터베이스 시작 정보 및 관리 작업을 제공합니다.
 *
 * @category Modules
 * @since 1.0.0
 */
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [database_controller_1.DatabaseController, database_user_controller_1.DatabaseUserController],
        providers: [database_service_1.DatabaseService, database_user_service_1.DatabaseUserService],
        imports: [_host_1.HostModule, cms_https_client_module_1.CmsHttpsClientModule, _repository_1.UserRepositoryModule]
    })
], DatabaseModule);


/***/ }),
/* 299 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var DatabaseController_1;
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const _api_interfaces_1 = __webpack_require__(205);
const _util_1 = __webpack_require__(263);
const database_service_1 = __webpack_require__(300);
/**
 * Controller for handling database operations.
 *
 * - Exposes REST endpoints to query start info and to start/stop/restart a DB
 * - Requires authentication; extracts `userId` from JWT (`req.user.sub`)
 * - All endpoints receive `hostUid` as a path parameter
 * - Follows RESTful pattern: /:hostUid/database/{action}/{identifier}
 *
 * 데이터베이스 작업을 처리하는 컨트롤러입니다.
 * - 시작 정보 조회 및 DB 시작/중지/재시작 REST 엔드포인트 제공
 * - 인증 필요, JWT의 `req.user.sub`에서 사용자 ID를 추출합니다
 * - 모든 엔드포인트는 경로 파라미터로 `hostUid`를 받습니다
 * - RESTful 패턴 준수: /:hostUid/database/{action}/{identifier}
 *
 * @category Controllers
 * @since 1.0.0
 */
let DatabaseController = DatabaseController_1 = class DatabaseController {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.logger = new common_1.Logger(DatabaseController_1.name);
    }
    /**
     * Get start information for databases on a host.
     * Returns only domain data (BaseCmsResponse fields stripped out).
     *
     * 호스트의 데이터베이스 시작 정보를 조회합니다. CMS 메타 필드(BaseCmsResponse)는 제거한 순수 데이터만 반환합니다.
     *
     * @route GET /:hostUid/database/start-info
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @returns StartInfoClientResponse Start info without CMS envelope fields
     * @example
     * // POST /host-uid/database/start-info
     */
    async getStartInfo(req, hostUid) {
        const userId = req.user.sub;
        common_1.Logger.log(`Getting start info for host: ${hostUid}`, 'DatabaseController');
        const response = await this.databaseService.startInfo(userId, hostUid);
        return response;
    }
    /**
     * Start a database on a host.
     * 성공 시 최신 시작 정보를 반환하고, 실패 시 도메인 에러(DatabaseError)를 던집니다.
     *
     * @route POST /:hostUid/database/start/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns StartInfoClientResponse 최신 데이터베이스 시작 정보
     * @example
     * // POST /host-uid/database/start/demodb
     */
    async startDatabase(req, hostUid, dbname) {
        const userId = req.user.sub;
        common_1.Logger.log(`Starting database: ${dbname} on host: ${hostUid}`, 'DatabaseController');
        const result = await this.databaseService.startDatabase(userId, hostUid, dbname);
        return result;
    }
    /**
     * Stop a database on a host.
     * 성공 시 최신 시작 정보를 반환하고, 실패 시 도메인 에러(DatabaseError)를 던집니다.
     *
     * @route POST /:hostUid/database/stop/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns StartInfoClientResponse 최신 데이터베이스 시작 정보
     * @example
     * // POST /host-uid/database/stop/demodb
     */
    async stopDatabase(req, hostUid, dbname) {
        const userId = req.user.sub;
        common_1.Logger.log(`Stopping database: ${dbname} on host: ${hostUid}`, 'DatabaseController');
        const result = await this.databaseService.stopDatabase(userId, hostUid, dbname);
        return result;
    }
    /**
     * Restart a database on a host (stop → start sequence).
     * 성공 시 최신 시작 정보를 반환하고, 중지/시작 단계별 실패 시 해당 도메인 에러를 던집니다.
     *
     * @route POST /:hostUid/database/restart/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns StartInfoClientResponse 최신 데이터베이스 시작 정보
     * @example
     * // POST /host-uid/database/restart/demodb
     */
    async restartDatabase(req, hostUid, dbname) {
        const userId = req.user.sub;
        common_1.Logger.log(`Restarting database: ${dbname} on host: ${hostUid}`, 'DatabaseController');
        const result = await this.databaseService.restartDatabase(userId, hostUid, dbname);
        return result;
    }
    /**
     * Save a database profile for a host.
     * 성공 시 최신 시작 정보를 반환합니다 (isProfileExists가 업데이트됨).
     *
     * @route POST /:hostUid/database/register/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @param body Request body containing `id`, `password`
     * @returns StartInfoClientResponse 최신 데이터베이스 시작 정보
     * @example
     * // POST /host-uid/database/register/demodb
     * // Body: { "id": "user", "password": "pass" }
     */
    async saveDatabaseProfile(req, hostUid, dbname, body) {
        const userId = req.user.sub;
        (0, _util_1.validateRequiredFields)(body, ['id', 'password'], 'database/register', this.logger);
        return await this.databaseService.saveDatabaseProfile(userId, hostUid, dbname, body.id, body.password);
    }
    /**
     * Get database volume/space information for a database on a host.
     * Returns domain-only data (CMS envelope removed).
     *
     * 특정 호스트의 데이터베이스 볼륨/공간 정보를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @route GET /:hostUid/database/volume-info/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns DatabaseVolumeInfoClientResponse 데이터베이스 볼륨/공간 정보
     * @example
     * // POST /host-uid/database/volume-info/demodb
     */
    async getDatabaseVolumeInfo(req, hostUid, dbname) {
        const userId = req.user.sub;
        common_1.Logger.log(`Getting volume info for database: ${dbname} on host: ${hostUid}`, 'DatabaseController');
        const response = await this.databaseService.getDBSpaceInfo(userId, hostUid, dbname);
        return response;
    }
    /**
     * Add automated backup schedule information for a database.
     * Returns empty object on success.
     *
     * 데이터베이스 백업 자동화(스케줄) 정보를 추가합니다.
     * 성공 시 빈 객체를 반환합니다.
     *
     * @route POST /:hostUid/database/backup-schedule/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @param body Request body containing backup schedule information
     * @returns AddBackupInfoClientResponse Empty object on success
     * @example
     * // POST /host-uid/database/backup-schedule/demodb
     * // Body: { "backupid": "test_backup", "path": "/path/to/backup", ... }
     */
    async addBackupSchedule(req, hostUid, dbname, body) {
        const userId = req.user.sub;
        (0, _util_1.validateRequiredFields)(body, ['backupid', 'path', 'period_type', 'period_date', 'time', 'level'], 'database/backup-schedule', this.logger);
        common_1.Logger.log(`Adding backup schedule for database: ${dbname} on host: ${hostUid}`, 'DatabaseController');
        return await this.databaseService.addBackupSchedule(userId, hostUid, dbname, body);
    }
    /**
     * Get automated backup schedule information for a database.
     * Returns domain-only data (CMS envelope removed).
     *
     * 데이터베이스 백업 자동화(스케줄) 정보를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @route GET /:hostUid/database/backup-schedule/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns GetBackupInfoClientResponse Backup schedule information
     * @example
     * // GET /host-uid/database/backup-schedule/demodb
     */
    async getBackupSchedule(req, hostUid, dbname) {
        const userId = req.user.sub;
        common_1.Logger.log(`Getting backup schedule for database: ${dbname} on host: ${hostUid}`, 'DatabaseController');
        return await this.databaseService.getBackupSchedule(userId, hostUid, dbname);
    }
    /**
     * Set auto-execution query for a database.
     * Returns empty object on success.
     *
     * 데이터베이스의 자동 실행 쿼리를 설정합니다.
     * 성공 시 빈 객체를 반환합니다.
     *
     * @route POST /:hostUid/database/auto-exec-query/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @param body Request body containing auto-execution query plan
     * @returns SetAutoExecQueryClientResponse Empty object on success
     * @example
     * // POST /host-uid/database/auto-exec-query/demodb
     * // Body: { "planlist": [{ "queryplan": [...] }] }
     */
    async setAutoExecQuery(req, hostUid, dbname, body) {
        const userId = req.user.sub;
        (0, _util_1.validateRequiredFields)(body, ['planlist'], 'database/auto-exec-query', this.logger);
        common_1.Logger.log(`Setting auto-exec query for database: ${dbname} on host: ${hostUid}`, 'DatabaseController');
        return await this.databaseService.setAutoExecQuery(userId, hostUid, dbname, body);
    }
    /**
     * Get auto-execution query for a database.
     * Returns domain-only data (CMS envelope removed).
     *
     * 데이터베이스의 자동 실행 쿼리를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @route GET /:hostUid/database/auto-exec-query/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns GetAutoExecQueryClientResponse Auto-execution query information
     * @example
     * // GET /host-uid/database/auto-exec-query/demodb
     */
    async getAutoExecQuery(req, hostUid, dbname) {
        const userId = req.user.sub;
        common_1.Logger.log(`Getting auto-exec query for database: ${dbname} on host: ${hostUid}`, 'DatabaseController');
        return await this.databaseService.getAutoExecQuery(userId, hostUid, dbname);
    }
};
exports.DatabaseController = DatabaseController;
tslib_1.__decorate([
    (0, common_1.Get)('start-info'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], DatabaseController.prototype, "getStartInfo", null);
tslib_1.__decorate([
    (0, common_1.Post)('start/:dbname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('dbname')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], DatabaseController.prototype, "startDatabase", null);
tslib_1.__decorate([
    (0, common_1.Post)('stop/:dbname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('dbname')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], DatabaseController.prototype, "stopDatabase", null);
tslib_1.__decorate([
    (0, common_1.Post)('restart/:dbname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('dbname')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], DatabaseController.prototype, "restartDatabase", null);
tslib_1.__decorate([
    (0, common_1.Post)('register/:dbname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('dbname')),
    tslib_1.__param(3, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String, typeof (_f = typeof Omit !== "undefined" && Omit) === "function" ? _f : Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], DatabaseController.prototype, "saveDatabaseProfile", null);
tslib_1.__decorate([
    (0, common_1.Get)('volume-info/:dbname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('dbname')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], DatabaseController.prototype, "getDatabaseVolumeInfo", null);
tslib_1.__decorate([
    (0, common_1.Post)('backup-schedule/:dbname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('dbname')),
    tslib_1.__param(3, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String, typeof (_j = typeof _api_interfaces_1.AddBackupInfoClientRequest !== "undefined" && _api_interfaces_1.AddBackupInfoClientRequest) === "function" ? _j : Object]),
    tslib_1.__metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], DatabaseController.prototype, "addBackupSchedule", null);
tslib_1.__decorate([
    (0, common_1.Get)('backup-schedule/:dbname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('dbname')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], DatabaseController.prototype, "getBackupSchedule", null);
tslib_1.__decorate([
    (0, common_1.Post)('auto-exec-query/:dbname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('dbname')),
    tslib_1.__param(3, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String, typeof (_m = typeof _api_interfaces_1.SetAutoExecQueryClientRequest !== "undefined" && _api_interfaces_1.SetAutoExecQueryClientRequest) === "function" ? _m : Object]),
    tslib_1.__metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], DatabaseController.prototype, "setAutoExecQuery", null);
tslib_1.__decorate([
    (0, common_1.Get)('auto-exec-query/:dbname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('dbname')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], DatabaseController.prototype, "getAutoExecQuery", null);
exports.DatabaseController = DatabaseController = DatabaseController_1 = tslib_1.__decorate([
    (0, common_1.Controller)(':hostUid/database'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof database_service_1.DatabaseService !== "undefined" && database_service_1.DatabaseService) === "function" ? _a : Object])
], DatabaseController);


/***/ }),
/* 300 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseService = void 0;
const tslib_1 = __webpack_require__(3);
const cms_https_client_service_1 = __webpack_require__(198);
const _common_1 = __webpack_require__(32);
const database_error_1 = __webpack_require__(41);
const index_1 = __webpack_require__(36);
const validation_error_1 = __webpack_require__(46);
const _host_1 = __webpack_require__(202);
const common_1 = __webpack_require__(6);
const _repository_1 = __webpack_require__(10);
const _api_interfaces_1 = __webpack_require__(205);
/**
 * Service for managing database operations.
 *
 * - Builds CMS requests (task, token, payload) and calls CMS HTTPS Client
 * - Evaluates CMS body `status` (HTTP code is always 200/201) to decide success
 * - Strips CMS envelope fields for domain-facing return types when needed
 *
 * 데이터베이스 작업을 관리하는 서비스입니다.
 * - CMS 요청(task, token, payload)을 구성하여 CMS HTTPS Client로 전달합니다
 * - CMS 본문 `status`로 성공/실패를 판단합니다(HTTP 200/201이 항상 반환됨)
 * - 필요 시 도메인에 반환할 때 CMS 메타 필드를 제거합니다
 *
 * @category Business Services
 * @since 1.0.0
 */
let DatabaseService = class DatabaseService {
    constructor(hostService, cmsClient, repository) {
        this.hostService = hostService;
        this.cmsClient = cmsClient;
        this.repository = repository;
    }
    /**
     * Get start information for databases on a host (internal use).
     * Returns raw CMS response without transformation.
     *
     * 특정 호스트의 데이터베이스 시작 정보를 조회합니다 (내부 사용).
     * CMS 응답을 변환 없이 그대로 반환합니다.
     *
     * @internal
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @returns StartInfoCmsResponse
     * @throws DatabaseError 요청 실패 또는 CMS status가 fail인 경우
     */
    async startInfoInternal(userId, hostUid) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const data = {
            task: 'startinfo',
            token: host.token || '',
        };
        const response = await this.cmsClient.postAuthenticated(url, data);
        (0, _common_1.checkCmsTokenError)(response);
        if (response.status === 'success') {
            return response;
        }
        else {
            throw database_error_1.DatabaseError.GetStartInfoFailed({ response });
        }
    }
    /**
     * Get start information for databases on a host.
     * Returns domain-only data (CMS envelope removed).
     *
     * 특정 호스트의 데이터베이스 시작 정보를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @returns StartInfoClientResponse
     * @throws DatabaseError 요청 실패 또는 CMS status가 fail인 경우
     */
    async startInfo(userId, hostUid) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const response = await this.startInfoInternal(userId, hostUid);
        const { __EXEC_TIME, note, status, task, ...dataOnly } = response;
        const dbProfiles = host.dbProfiles || {};
        const dbs = dataOnly.dblist?.[0]?.dbs || [];
        const activeList = dataOnly.activelist?.[0]?.active || [];
        const clientResponse = {
            activelist: { active: activeList },
            dblist: {
                dbs: dbs.map((db) => ({
                    ...db,
                    isProfileExists: !!dbProfiles[db.dbname],
                })),
            },
        };
        return clientResponse;
    }
    /**
     * Start a database on a host.
     *
     * 특정 호스트의 데이터베이스를 시작합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 시작할 DB 이름
     * @returns 성공 시 최신 시작 정보 (StartInfoClientResponse)
     * @throws DatabaseError CMS status가 fail인 경우
     */
    async startDatabase(userId, hostUid, dbname) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const data = {
            task: 'startdb',
            token: host.token || '',
            dbname: dbname,
        };
        const response = await this.cmsClient.postAuthenticated(url, data);
        (0, _common_1.checkCmsTokenError)(response);
        if (response.status === 'success') {
            return await this.startInfo(userId, hostUid);
        }
        throw database_error_1.DatabaseError.StartDatabaseFailed({ response, dbname });
    }
    /**
     * Stop a database on a host.
     *
     * 특정 호스트의 데이터베이스를 중지합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 중지할 DB 이름
     * @returns 성공 시 최신 시작 정보 (StartInfoClientResponse)
     * @throws DatabaseError CMS status가 fail인 경우
     */
    async stopDatabase(userId, hostUid, dbname) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const data = {
            task: 'stopdb',
            token: host.token || '',
            dbname: dbname,
        };
        const response = await this.cmsClient.postAuthenticated(url, data);
        (0, _common_1.checkCmsTokenError)(response);
        if (response.status === 'success') {
            return await this.startInfo(userId, hostUid);
        }
        throw database_error_1.DatabaseError.StopDatabaseFailed({ response, dbname });
    }
    /**
     * Restart a database (stop then start).
     *
     * 특정 호스트의 데이터베이스를 재시작합니다(중지 후 시작 순차 수행).
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 재시작할 DB 이름
     * @returns 성공 시 최신 시작 정보 (StartInfoClientResponse)
     * @throws DatabaseError 중지/시작 단계에서 실패 시 해당 에러
     */
    async restartDatabase(userId, hostUid, dbname) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const stopRequest = {
            task: 'stopdb',
            token: host.token || '',
            dbname: dbname,
        };
        const stopResponse = await this.cmsClient.postAuthenticated(url, stopRequest);
        (0, _common_1.checkCmsTokenError)(stopResponse);
        if (stopResponse.status === 'success') {
            const startRequest = {
                task: 'startdb',
                token: host.token || '',
                dbname: dbname,
            };
            const startResponse = await this.cmsClient.postAuthenticated(url, startRequest);
            (0, _common_1.checkCmsTokenError)(startResponse);
            if (startResponse.status === 'success') {
                return await this.startInfo(userId, hostUid);
            }
            else {
                throw database_error_1.DatabaseError.StartDatabaseFailed({
                    response: startResponse,
                    dbname,
                });
            }
        }
        else {
            throw database_error_1.DatabaseError.StopDatabaseFailed({
                response: stopResponse,
                dbname,
            });
        }
    }
    /**
     * Save a database profile for a host.
     *
     * 호스트에 대한 데이터베이스 프로파일을 저장합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 데이터베이스 이름
     * @param databaseId 데이터베이스 사용자 ID
     * @param databasePassword 데이터베이스 비밀번호
     * @returns 성공 시 최신 시작 정보 (StartInfoClientResponse)
     * @throws DatabaseError 프로파일이 이미 존재하거나 저장 실패 시
     */
    async saveDatabaseProfile(userId, hostUid, dbname, databaseId, databasePassword) {
        if (dbname == null || databaseId == null || databasePassword == null) {
            const missingFields = [
                dbname == null && 'dbname',
                databaseId == null && 'id',
                databasePassword == null && 'password',
            ].filter(Boolean);
            throw validation_error_1.ValidationError.MissingDBCredentials(dbname || 'unknown', missingFields);
        }
        await this.repository.atomicUpdateUser(userId, async (user) => {
            const host = user.host_list[hostUid];
            if (!host) {
                throw index_1.HostError.NoSuchHost({ hostUid });
            }
            if (host.dbProfiles == null) {
                host.dbProfiles = {};
            }
            if (host.dbProfiles[dbname]) {
                throw database_error_1.DatabaseError.DuplicatedDatabaseProfile({
                    dbname,
                    hostUid,
                });
            }
            host.dbProfiles[dbname] = {
                dbname,
                id: databaseId,
                password: databasePassword,
            };
            return user;
        });
        return await this.startInfo(userId, hostUid);
    }
    /**
     * Get database volume/space information for a database on a host.
     * Returns domain-only data (CMS envelope removed).
     *
     * 특정 호스트의 데이터베이스 볼륨/공간 정보를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 데이터베이스 이름
     * @returns DatabaseVolumeInfoClientResponse
     * @throws DatabaseError 요청 실패 또는 CMS status가 fail인 경우
     */
    async getDBSpaceInfo(userId, hostUid, dbname) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const startInfoRequest = {
            task: 'startinfo',
            token: host.token || '',
        };
        const startInfo = await this.cmsClient.postAuthenticated(url, startInfoRequest);
        if ('dblist' in startInfo && 'activelist' in startInfo) {
            const dbExists = startInfo.dblist.some((el) => el.dbs.some((db) => db.dbname === dbname));
            if (!dbExists) {
                throw database_error_1.DatabaseError.NoSuchDatabase({ dbname, hostUid });
            }
        }
        else {
            (0, _common_1.checkCmsTokenError)(startInfo);
            throw database_error_1.DatabaseError.InternalError();
        }
        const spaceInfoRequest = {
            task: 'dbspaceinfo',
            token: host.token || '',
            dbname: dbname,
        };
        const response = await this.cmsClient.postAuthenticated(url, spaceInfoRequest);
        (0, _common_1.checkCmsTokenError)(response);
        if (response.status === 'success') {
            const { __EXEC_TIME, note, status, task, ...dataOnly } = response;
            return dataOnly;
        }
        else {
            throw database_error_1.DatabaseError.GetDBSpaceInfoFailed({ response, dbname });
        }
    }
    /**
     * Add automated backup schedule information for a database.
     * Returns empty object on success (CMS envelope fields removed).
     *
     * 데이터베이스의 백업 정보를 추가합니다.
     * 성공 시 빈 객체를 반환합니다 (CMS 메타 필드 제거).
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 데이터베이스 이름
     * @param backupInfo 백업 정보
     * @returns AddBackupInfoClientResponse 성공 시 빈 객체
     * @throws DatabaseError 요청 실패 또는 CMS status가 fail인 경우
     */
    async addBackupSchedule(userId, hostUid, dbname, backupInfo) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request = {
            task: 'addbackupinfo',
            token: host.token || '',
            dbname: dbname,
            backupid: backupInfo.backupid,
            path: backupInfo.path,
            period_type: backupInfo.period_type,
            period_date: backupInfo.period_date,
            time: backupInfo.time,
            level: backupInfo.level,
            archivedel: backupInfo.archivedel,
            updatestatus: backupInfo.updatestatus,
            storeold: backupInfo.storeold,
            onoff: backupInfo.onoff,
            zip: backupInfo.zip,
            check: backupInfo.check,
            mt: backupInfo.mt,
            bknum: backupInfo.bknum,
        };
        const response = await this.cmsClient.postAuthenticated(url, request);
        (0, _common_1.checkCmsTokenError)(response);
        (0, _common_1.checkCmsStatusError)(response);
        return {};
    }
    /**
     * Get automated backup schedule information for a database.
     * Returns domain-only data (CMS envelope removed).
     *
     * 데이터베이스의 백업 정보를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 데이터베이스 이름
     * @returns GetBackupInfoClientResponse 백업 정보
     * @throws DatabaseError 요청 실패 또는 CMS status가 fail인 경우
     */
    async getBackupSchedule(userId, hostUid, dbname) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request = {
            task: 'getbackupinfo',
            token: host.token || '',
            dbname: dbname,
        };
        const response = await this.cmsClient.postAuthenticated(url, request);
        (0, _common_1.checkCmsTokenError)(response);
        (0, _common_1.checkCmsStatusError)(response);
        const { __EXEC_TIME, note, status, task, dbname: responseDbname, ...rest } = response;
        const backupArray = rest[dbname];
        return {
            dbname: responseDbname,
            backups: backupArray || [],
        };
    }
    /**
     * Set auto-execution query for a database.
     * Returns empty object on success (CMS envelope fields removed).
     *
     * 데이터베이스의 자동 실행 쿼리를 설정합니다.
     * 성공 시 빈 객체를 반환합니다 (CMS 메타 필드 제거).
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 데이터베이스 이름
     * @param autoExecQuery 자동 실행 쿼리 설정
     * @returns SetAutoExecQueryClientResponse 성공 시 빈 객체
     * @throws DatabaseError 요청 실패 또는 CMS status가 fail인 경우
     */
    async setAutoExecQuery(userId, hostUid, dbname, autoExecQuery) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request = {
            task: 'setautoexecquery',
            token: host.token || '',
            dbname: dbname,
            planlist: autoExecQuery.planlist,
        };
        const response = await this.cmsClient.postAuthenticated(url, request);
        (0, _common_1.checkCmsTokenError)(response);
        (0, _common_1.checkCmsStatusError)(response);
        return {};
    }
    /**
     * Get auto-execution query for a database.
     * Returns domain-only data (CMS envelope removed).
     *
     * 데이터베이스의 자동 실행 쿼리를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 데이터베이스 이름
     * @returns GetAutoExecQueryClientResponse 자동 실행 쿼리 정보
     * @throws DatabaseError 요청 실패 또는 CMS status가 fail인 경우
     */
    async getAutoExecQuery(userId, hostUid, dbname) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request = {
            task: 'getautoexecquery',
            token: host.token || '',
            dbname: dbname,
        };
        const response = await this.cmsClient.postAuthenticated(url, request);
        (0, _common_1.checkCmsTokenError)(response);
        (0, _common_1.checkCmsStatusError)(response);
        const { __EXEC_TIME, note, status, task, ...dataOnly } = response;
        const planlist = dataOnly.planlist.map(plan => {
            const queryplan = plan.queryplan.map(query => {
                const queryAny = query;
                if (queryAny['@username'] !== undefined) {
                    const { '@username': atUsername, ...rest } = queryAny;
                    return {
                        ...rest,
                        username: atUsername || '',
                    };
                }
                return queryAny;
            });
            return {
                dbname: plan.dbname,
                queryplan: queryplan,
            };
        });
        return {
            planlist: planlist,
        };
    }
    async createDatabase() {
    }
};
exports.DatabaseService = DatabaseService;
tslib_1.__decorate([
    (0, _common_1.HandleDatabaseErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], DatabaseService.prototype, "startInfoInternal", null);
tslib_1.__decorate([
    (0, _common_1.HandleDatabaseErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], DatabaseService.prototype, "startInfo", null);
tslib_1.__decorate([
    (0, _common_1.HandleDatabaseErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], DatabaseService.prototype, "startDatabase", null);
tslib_1.__decorate([
    (0, _common_1.HandleDatabaseErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], DatabaseService.prototype, "stopDatabase", null);
tslib_1.__decorate([
    (0, _common_1.HandleDatabaseErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], DatabaseService.prototype, "restartDatabase", null);
tslib_1.__decorate([
    (0, _common_1.HandleDatabaseErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], DatabaseService.prototype, "saveDatabaseProfile", null);
tslib_1.__decorate([
    (0, _common_1.HandleDatabaseErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], DatabaseService.prototype, "getDBSpaceInfo", null);
tslib_1.__decorate([
    (0, _common_1.HandleDatabaseErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, typeof (_l = typeof _api_interfaces_1.AddBackupInfoClientRequest !== "undefined" && _api_interfaces_1.AddBackupInfoClientRequest) === "function" ? _l : Object]),
    tslib_1.__metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], DatabaseService.prototype, "addBackupSchedule", null);
tslib_1.__decorate([
    (0, _common_1.HandleDatabaseErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], DatabaseService.prototype, "getBackupSchedule", null);
tslib_1.__decorate([
    (0, _common_1.HandleDatabaseErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, typeof (_p = typeof _api_interfaces_1.SetAutoExecQueryClientRequest !== "undefined" && _api_interfaces_1.SetAutoExecQueryClientRequest) === "function" ? _p : Object]),
    tslib_1.__metadata("design:returntype", typeof (_q = typeof Promise !== "undefined" && Promise) === "function" ? _q : Object)
], DatabaseService.prototype, "setAutoExecQuery", null);
tslib_1.__decorate([
    (0, _common_1.HandleDatabaseErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_r = typeof Promise !== "undefined" && Promise) === "function" ? _r : Object)
], DatabaseService.prototype, "getAutoExecQuery", null);
tslib_1.__decorate([
    (0, _common_1.HandleDatabaseErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], DatabaseService.prototype, "createDatabase", null);
exports.DatabaseService = DatabaseService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof _host_1.HostService !== "undefined" && _host_1.HostService) === "function" ? _a : Object, typeof (_b = typeof cms_https_client_service_1.CmsHttpsClientService !== "undefined" && cms_https_client_service_1.CmsHttpsClientService) === "function" ? _b : Object, typeof (_c = typeof _repository_1.UserRepositoryService !== "undefined" && _repository_1.UserRepositoryService) === "function" ? _c : Object])
], DatabaseService);


/***/ }),
/* 301 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var DatabaseUserController_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseUserController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const database_user_service_1 = __webpack_require__(302);
/**
 * Controller for managing database users.
 *
 * 데이터베이스 사용자 관리를 위한 컨트롤러입니다.
 * - 모든 엔드포인트는 경로 파라미터로 `hostUid`를 받습니다
 * - RESTful 패턴 준수: /:hostUid/database/users/{action}/{identifier}
 *
 * @category Controllers
 * @since 1.0.0
 */
let DatabaseUserController = DatabaseUserController_1 = class DatabaseUserController {
    constructor(databaseUserService) {
        this.databaseUserService = databaseUserService;
        this.logger = new common_1.Logger(DatabaseUserController_1.name);
    }
    /**
     * Get list of database users for a specific host.
     *
     * 특정 호스트의 데이터베이스 사용자 목록을 조회합니다.
     *
     * @route GET /:hostUid/database/users
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @returns Database users list
     * @example
     * // GET /host-uid/database/users
     */
    async getDatabaseUsers(req, hostUid) {
        const userId = req.user.sub;
        // TODO: Implement
        return await this.databaseUserService.getDatabaseUsers(userId);
    }
    /**
     * Login to a database using profile or client-provided credentials.
     *
     * 프로파일 또는 클라이언트 제공 자격 증명을 사용하여 데이터베이스에 로그인합니다.
     *
     * - Profile이 있는 경우: dbname만 필요 (body에 id, password 불필요)
     * - Profile이 없는 경우: dbname + id + password 필요
     *
     * @route POST /:hostUid/database/users/login/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @param body Request body containing optional `id`, `password` (required if no profile)
     * @returns boolean True on success
     * @example
     * // POST /host-uid/database/users/login/demodb
     * // Body (if no profile): { "id": "user", "password": "pass" }
     */
    async loginDatabase(req, hostUid, dbname, body) {
        const userId = req.user.sub;
        common_1.Logger.log(`Logging in to database: ${dbname} on host: ${hostUid}`, 'DatabaseUserController');
        const result = await this.databaseUserService.loginDatabase(userId, hostUid, dbname, body.id, body.password);
        return result;
    }
};
exports.DatabaseUserController = DatabaseUserController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], DatabaseUserController.prototype, "getDatabaseUsers", null);
tslib_1.__decorate([
    (0, common_1.Post)('login/:dbname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('dbname')),
    tslib_1.__param(3, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String, typeof (_b = typeof Omit !== "undefined" && Omit) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], DatabaseUserController.prototype, "loginDatabase", null);
exports.DatabaseUserController = DatabaseUserController = DatabaseUserController_1 = tslib_1.__decorate([
    (0, common_1.Controller)(':hostUid/database/users'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof database_user_service_1.DatabaseUserService !== "undefined" && database_user_service_1.DatabaseUserService) === "function" ? _a : Object])
], DatabaseUserController);


/***/ }),
/* 302 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseUserService = void 0;
const tslib_1 = __webpack_require__(3);
const _common_1 = __webpack_require__(32);
const database_error_1 = __webpack_require__(41);
const _host_1 = __webpack_require__(202);
const common_1 = __webpack_require__(6);
const _repository_1 = __webpack_require__(10);
const db_auth_resolver_1 = __webpack_require__(270);
const cms_https_client_service_1 = __webpack_require__(198);
/**
 * Service for managing database users.
 *
 * 데이터베이스 사용자 관리를 위한 서비스입니다.
 *
 * @category Business Services
 * @since 1.0.0
 */
let DatabaseUserService = class DatabaseUserService {
    constructor(repository, cmsClient, hostService) {
        this.repository = repository;
        this.cmsClient = cmsClient;
        this.hostService = hostService;
    }
    /**
     * Get list of database users for a specific host.
     *
     * 특정 호스트의 데이터베이스 사용자 목록을 조회합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @returns Database users list
     */
    async getDatabaseUsers(userId) {
        return [];
    }
    /**
     * Login to a database using profile or client-provided credentials.
     *
     * 프로파일 또는 클라이언트 제공 자격 증명을 사용하여 데이터베이스에 로그인합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 데이터베이스 이름
     * @param clientId 클라이언트 제공 DB 사용자 ID (프로파일이 없는 경우 필수)
     * @param clientPassword 클라이언트 제공 DB 비밀번호 (프로파일이 없는 경우 필수)
     * @returns 성공 시 true
     * @throws DatabaseError CMS status가 fail인 경우 또는 프로파일이 없고 자격 증명이 제공되지 않은 경우
     */
    async loginDatabase(userId, hostUid, dbname, clientId, clientPassword) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const dbAuth = db_auth_resolver_1.DBAuthResolver.resolve(host, dbname, clientId, clientPassword);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const data = {
            task: 'dbmtuserlogin',
            token: host.token || '',
            targetid: host.id,
            dbname: dbAuth.dbname,
            dbuser: dbAuth.id,
            dbpasswd: dbAuth.password,
        };
        const response = await this.cmsClient.postAuthenticated(url, data);
        (0, _common_1.checkCmsTokenError)(response);
        if (response.status === 'success') {
            return true;
        }
        throw database_error_1.DatabaseError.LoginDatabaseFailed({ response, dbname });
    }
};
exports.DatabaseUserService = DatabaseUserService;
tslib_1.__decorate([
    (0, _common_1.HandleHostErrors)(),
    (0, _common_1.HandleCmsHttpsClientErrors)(),
    (0, _common_1.HandleDatabaseErrors)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], DatabaseUserService.prototype, "loginDatabase", null);
exports.DatabaseUserService = DatabaseUserService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof _repository_1.UserRepositoryService !== "undefined" && _repository_1.UserRepositoryService) === "function" ? _a : Object, typeof (_b = typeof cms_https_client_service_1.CmsHttpsClientService !== "undefined" && cms_https_client_service_1.CmsHttpsClientService) === "function" ? _b : Object, typeof (_c = typeof _host_1.HostService !== "undefined" && _host_1.HostService) === "function" ? _c : Object])
], DatabaseUserService);


/***/ }),
/* 303 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const log_controller_1 = __webpack_require__(304);
const log_service_1 = __webpack_require__(305);
const cms_https_client_module_1 = __webpack_require__(274);
const _host_1 = __webpack_require__(202);
let LogModule = class LogModule {
};
exports.LogModule = LogModule;
exports.LogModule = LogModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [log_controller_1.LogController],
        providers: [log_service_1.LogService],
        exports: [log_service_1.LogService],
        imports: [cms_https_client_module_1.CmsHttpsClientModule, _host_1.HostModule],
    })
], LogModule);


/***/ }),
/* 304 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var LogController_1;
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(6);
const log_service_1 = __webpack_require__(305);
const _api_interfaces_1 = __webpack_require__(205);
const _util_1 = __webpack_require__(263);
/**
 * Controller for handling log-related operations.
 *
 * 로그 관련 작업을 처리하는 컨트롤러입니다.
 * - 모든 엔드포인트는 경로 파라미터로 `hostUid`를 받습니다
 * - RESTful 패턴 준수: /:hostUid/log/{action}/{identifier}
 *
 * @category Controllers
 * @since 1.0.0
 */
let LogController = LogController_1 = class LogController {
    constructor(logService) {
        this.logService = logService;
        this.logger = new common_1.Logger(LogController_1.name);
    }
    /**
     * Get list of broker log files.
     *
     * 브로커 로그 파일 목록을 조회합니다.
     *
     * @route GET /:hostUid/log/broker/:bname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param bname Broker name from path parameter
     * @returns GetBrokerLogListClientResponse Broker log file list
     * @example
     * // GET /host-uid-1/log/broker/query_editor
     */
    async getBrokerLogList(req, hostUid, bname) {
        const userId = req.user.sub;
        common_1.Logger.log(`Getting broker log list: ${bname} on host: ${hostUid}`, 'LogController');
        return await this.logService.getBrokerLogList(userId, hostUid, bname);
    }
    /**
     * Get list of database log files.
     *
     * 데이터베이스 로그 파일 목록을 조회합니다.
     *
     * @route GET /:hostUid/log/database/:dname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dname Database name from path parameter
     * @returns GetDatabaseLogListClientResponse Database log file list
     * @example
     * // GET /host-uid-1/log/database/demodb
     */
    async getDatabaseLogList(req, hostUid, dbname) {
        const userId = req.user.sub;
        common_1.Logger.log(`Getting database log list: ${dbname} on host: ${hostUid}`, 'LogController');
        return await this.logService.getDatabaseLogList(userId, hostUid, dbname);
    }
    /**
     * Get CMS access log and error log.
     *
     * CMS 접근 로그 및 에러 로그를 조회합니다.
     *
     * @route GET /:hostUid/log/cms
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @returns LoadAccessLogClientResponse CMS access log and error log
     * @example
     * // GET /host-uid-1/log/cms
     */
    async getCMSLogList(req, hostUid) {
        const userId = req.user.sub;
        common_1.Logger.log(`Getting CMS log list for host: ${hostUid}`, 'LogController');
        return await this.logService.getCMSLogList(userId, hostUid);
    }
    /**
     * Get admin log information.
     *
     * 관리자 로그 정보를 조회합니다.
     *
     * @route GET /:hostUid/log/admin
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @returns GetAdminLogInfoClientResponse Admin log information without CMS envelope fields
     * @example
     * // GET /host-uid-1/log/admin
     */
    async getAdminLogInfo(req, hostUid) {
        const userId = req.user.sub;
        common_1.Logger.log(`Getting admin log info for host: ${hostUid}`, 'LogController');
        return await this.logService.getAdminLogInfo(userId, hostUid);
    }
    /**
     * View log file content.
     * Returns log lines within the specified range.
     *
     * 로그 파일 내용을 조회합니다.
     * 지정된 범위 내의 로그 라인을 반환합니다.
     *
     * @route POST /:hostUid/log/view
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param body Request body containing path, start, end
     * @returns ViewLogClientResponse Log file content without CMS envelope fields
     * @example
     * // POST /host-uid-1/log/view
     * // Body: { "path": "/path/to/log.err", "start": "1", "end": "100" }
     */
    async viewLog(req, hostUid, body) {
        const userId = req.user.sub;
        (0, _util_1.validateRequiredFields)(body, ['path', 'start', 'end'], 'log/view', this.logger);
        common_1.Logger.log(`Viewing log file: ${body.path} (${body.start}-${body.end}) on host: ${hostUid}`, 'LogController');
        return await this.logService.viewLog(userId, hostUid, body.path, body.start, body.end);
    }
};
exports.LogController = LogController;
tslib_1.__decorate([
    (0, common_1.Get)('broker/:bname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('bname')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], LogController.prototype, "getBrokerLogList", null);
tslib_1.__decorate([
    (0, common_1.Get)('database/:dbname'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Param)('dbname')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], LogController.prototype, "getDatabaseLogList", null);
tslib_1.__decorate([
    (0, common_1.Get)('cms'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], LogController.prototype, "getCMSLogList", null);
tslib_1.__decorate([
    (0, common_1.Get)('admin'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], LogController.prototype, "getAdminLogInfo", null);
tslib_1.__decorate([
    (0, common_1.Post)('view'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('hostUid')),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, typeof (_f = typeof _api_interfaces_1.ViewLogClientRequest !== "undefined" && _api_interfaces_1.ViewLogClientRequest) === "function" ? _f : Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], LogController.prototype, "viewLog", null);
exports.LogController = LogController = LogController_1 = tslib_1.__decorate([
    (0, common_1.Controller)(':hostUid/log'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof log_service_1.LogService !== "undefined" && log_service_1.LogService) === "function" ? _a : Object])
], LogController);


/***/ }),
/* 305 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogService = void 0;
const tslib_1 = __webpack_require__(3);
const cms_https_client_service_1 = __webpack_require__(198);
const _host_1 = __webpack_require__(202);
const common_1 = __webpack_require__(6);
const _common_1 = __webpack_require__(32);
let LogService = class LogService {
    constructor(client, hostService) {
        this.client = client;
        this.hostService = hostService;
    }
    async getBrokerLogList(userId, hostUid, bname) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body = {
            task: 'getlogfileinfo',
            token: host.token || '',
            broker: bname,
        };
        const cmsResponse = await this.client.postAuthenticated(url, body);
        (0, _common_1.checkCmsTokenError)(cmsResponse);
        (0, _common_1.checkCmsStatusError)(cmsResponse);
        common_1.Logger.debug(cmsResponse);
        const response = {
            broker: cmsResponse.broker,
            logfileinfo: cmsResponse.logfileinfo,
        };
        return response;
    }
    async getDatabaseLogList(userId, hostUid, dbname) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body = {
            task: 'getloginfo',
            token: host.token || '',
            dbname: dbname,
        };
        const cmsResponse = await this.client.postAuthenticated(url, body);
        (0, _common_1.checkCmsTokenError)(cmsResponse);
        (0, _common_1.checkCmsStatusError)(cmsResponse);
        const response = {
            dbname: cmsResponse.dbname,
            loginfo: cmsResponse.loginfo,
        };
        return response;
    }
    async getCMSLogList(userId, hostUid) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body = {
            task: 'loadaccesslog',
            token: host.token || '',
        };
        const cmsResponse = await this.client.postAuthenticated(url, body);
        (0, _common_1.checkCmsTokenError)(cmsResponse);
        (0, _common_1.checkCmsStatusError)(cmsResponse);
        const response = {
            accesslog: cmsResponse.accesslog,
            errorlog: cmsResponse.errorlog,
        };
        return response;
    }
    /**
     * View broker log file content.
     * Returns log lines within the specified range.
     *
     * 브로커 로그 파일 내용을 조회합니다.
     * 지정된 범위 내의 로그 라인을 반환합니다.
     *
     * @param userId - User ID from JWT
     * @param hostUid - Host unique identifier
     * @param path - Log file path
     * @param start - Start line number (1-based)
     * @param end - End line number (1-based)
     * @returns ViewLogClientResponse Log file content without CMS envelope fields
     */
    async viewLog(userId, hostUid, path, start, end) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body = {
            task: 'viewlog',
            token: host.token || '',
            path: path,
            start: start,
            end: end,
        };
        const cmsResponse = await this.client.postAuthenticated(url, body);
        (0, _common_1.checkCmsTokenError)(cmsResponse);
        (0, _common_1.checkCmsStatusError)(cmsResponse);
        const { __EXEC_TIME, note, status, task, ...dataOnly } = cmsResponse;
        return dataOnly;
    }
    /**
     * Get admin log information from a CMS host.
     * Returns admin log file information without CMS envelope fields.
     *
     * CMS 호스트의 관리자 로그 정보를 조회합니다.
     * CMS 메타 필드를 제거한 관리자 로그 파일 정보를 반환합니다.
     *
     * @param userId - User ID from JWT
     * @param hostUid - Host unique identifier
     * @returns GetAdminLogInfoClientResponse Admin log information without CMS envelope fields
     */
    async getAdminLogInfo(userId, hostUid) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body = {
            task: 'getadminloginfo',
            token: host.token || '',
        };
        const cmsResponse = await this.client.postAuthenticated(url, body);
        (0, _common_1.checkCmsTokenError)(cmsResponse);
        (0, _common_1.checkCmsStatusError)(cmsResponse);
        const { __EXEC_TIME, note, status, task, ...dataOnly } = cmsResponse;
        return dataOnly;
    }
};
exports.LogService = LogService;
exports.LogService = LogService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof cms_https_client_service_1.CmsHttpsClientService !== "undefined" && cms_https_client_service_1.CmsHttpsClientService) === "function" ? _a : Object, typeof (_b = typeof _host_1.HostService !== "undefined" && _host_1.HostService) === "function" ? _b : Object])
], LogService);


/***/ }),
/* 306 */
/***/ ((module) => {

module.exports = require("module-alias/register");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(1);
const app_module_1 = __webpack_require__(2);
__webpack_require__(306);
const ssl_util_1 = __webpack_require__(266);
const global_filter_1 = __webpack_require__(50);
const config_service_1 = __webpack_require__(8);
const _common_1 = __webpack_require__(32); // Updated import
async function bootstrap() {
    const httpsOptions = (0, ssl_util_1.getOrCreateSSLCert)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { httpsOptions });
    const configService = app.get(config_service_1.ConfigService);
    const port = configService.getPort();
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
    }
    else {
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
    app.useGlobalFilters(new global_filter_1.GlobalExceptionFilter());
    app.useGlobalInterceptors(new _common_1.LoggingInterceptor(), new _common_1.SuccessResponseInterceptor());
    await app.listen(port);
    console.log('\t@ server running port :', port);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map