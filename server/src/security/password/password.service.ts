import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

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
@Injectable()
export class PasswordService {
    private readonly HASH_ROUND = 10;

    /**
     * Compares a plain text password with a hashed password.
     * 평문 비밀번호와 해시된 비밀번호를 비교합니다.
     *
     * @param plain - The plain text password.
     * @param hash - The hashed password.
     * @returns A Promise that resolves to true if the passwords match, false otherwise.
     */
    async comparePlainAndHash(plain: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(plain, hash);
    }

    /**
     * Generates a hash for the given plain text password.
     * 주어진 평문 비밀번호에 대한 해시를 생성합니다.
     *
     * @param plain - The plain text password or number to hash.
     * @returns A Promise that resolves to the hashed password string.
     */
    async getHashedValue(plain: string | number): Promise<string> {
        const textPlain = plain.toString();
        const hashed = await bcrypt.hash(textPlain, this.HASH_ROUND);
        return hashed;
    }
}
