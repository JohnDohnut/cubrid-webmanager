import { ConfigService } from '@config/config.service';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

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
@Injectable()
export class EncryptionService {
    constructor(private readonly configService: ConfigService) {}
    private readonly algorithm = 'aes-256-cbc';

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
    getHashedValue(plain: string | number): string {
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
    encryptValue(plain: string): string {
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
    decryptValue(cipher: string): string {
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
}
