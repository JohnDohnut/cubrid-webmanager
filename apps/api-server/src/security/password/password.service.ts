import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

/**
 * Service for password hashing and verification operations.
 *
 * Provides functionality for password hashing using bcrypt and
 * password verification for authentication purposes.
 *
 * @category Infrastructure Services
 * @since 1.0.0
 */
@Injectable()
export class PasswordService {
  private readonly HASH_ROUND = 10;

  /**
   * Compares a plain text password with a hashed password.
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
