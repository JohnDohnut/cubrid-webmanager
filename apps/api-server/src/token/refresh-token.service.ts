import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { getStoragePath } from '@util';
import { REFRESH_TOKEN_EXPIRES_MS, TOKEN_CLEANUP_INTERVAL_MS } from './token.constants';

export type RefreshTokenRecord = {
  userId: string;
  familyId: string;
  expiresAt: string;
  createdAt: string;
};

@Injectable()
export class RefreshTokenService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RefreshTokenService.name);
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  private root(): string {
    return path.join(getStoragePath(), 'refresh-tokens');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private tokenPath(token: string): string {
    return path.join(this.root(), `${this.hashToken(token)}.json`);
  }

  onModuleInit(): void {
    void this.purgeExpired();
    this.cleanupTimer = setInterval(() => void this.purgeExpired(), TOKEN_CLEANUP_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  async create(userId: string, familyId?: string): Promise<{ token: string; familyId: string }> {
    const token = crypto.randomBytes(32).toString('base64url');
    const family = familyId ?? crypto.randomUUID();
    const now = new Date();
    const record: RefreshTokenRecord = {
      userId,
      familyId: family,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + REFRESH_TOKEN_EXPIRES_MS).toISOString(),
    };

    await fs.mkdir(this.root(), { recursive: true });
    await fs.writeFile(this.tokenPath(token), JSON.stringify(record), 'utf8');
    return { token, familyId: family };
  }

  async find(token: string): Promise<RefreshTokenRecord | null> {
    try {
      const raw = await fs.readFile(this.tokenPath(token), 'utf8');
      const record = JSON.parse(raw) as RefreshTokenRecord;
      if (Date.now() >= Date.parse(record.expiresAt)) {
        await this.revoke(token);
        return null;
      }
      return record;
    } catch (err: any) {
      if (err?.code === 'ENOENT') return null;
      throw err;
    }
  }

  async revoke(token: string): Promise<void> {
    await fs.unlink(this.tokenPath(token)).catch(() => undefined);
  }

  async revokeFamily(familyId: string): Promise<void> {
    let files: string[];
    try {
      files = await fs.readdir(this.root());
    } catch (err: any) {
      if (err?.code === 'ENOENT') return;
      throw err;
    }

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const filePath = path.join(this.root(), file);
      try {
        const raw = await fs.readFile(filePath, 'utf8');
        const record = JSON.parse(raw) as RefreshTokenRecord;
        if (record.familyId === familyId) {
          await fs.unlink(filePath);
        }
      } catch {
        await fs.unlink(filePath).catch(() => undefined);
      }
    }
  }

  async purgeExpired(): Promise<number> {
    let removed = 0;
    const now = Date.now();
    let files: string[];
    try {
      files = await fs.readdir(this.root());
    } catch (err: any) {
      if (err?.code === 'ENOENT') return 0;
      throw err;
    }

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const filePath = path.join(this.root(), file);
      try {
        const raw = await fs.readFile(filePath, 'utf8');
        const record = JSON.parse(raw) as RefreshTokenRecord;
        if (now >= Date.parse(record.expiresAt)) {
          await fs.unlink(filePath);
          removed += 1;
        }
      } catch {
        await fs.unlink(filePath).catch(() => undefined);
        removed += 1;
      }
    }

    if (removed > 0) {
      this.logger.debug(`Purged ${removed} expired refresh tokens`);
    }
    return removed;
  }
}
