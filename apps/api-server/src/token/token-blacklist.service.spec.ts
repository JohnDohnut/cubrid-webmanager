import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { TokenBlacklistService } from './token-blacklist.service';

jest.mock('@util', () => ({
  getStoragePath: jest.fn(),
}));

import { getStoragePath } from '@util';

describe('TokenBlacklistService', () => {
  let service: TokenBlacklistService;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'wm-blacklist-'));
    (getStoragePath as jest.Mock).mockReturnValue(tempDir);
    service = new TokenBlacklistService();
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('marks and detects blacklisted jti until expiry', async () => {
    const expiresAt = new Date(Date.now() + 60_000);
    await service.add('jti-abc', expiresAt);

    expect(await service.isBlacklisted('jti-abc')).toBe(true);
    expect(await service.isBlacklisted('other')).toBe(false);
  });

  it('purges expired blacklist entries', async () => {
    await service.add('expired-jti', new Date(Date.now() - 1_000));
    const removed = await service.purgeExpired();
    expect(removed).toBe(1);
    expect(await service.isBlacklisted('expired-jti')).toBe(false);
  });
});
