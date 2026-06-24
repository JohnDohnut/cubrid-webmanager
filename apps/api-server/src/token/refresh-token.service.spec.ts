import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { RefreshTokenService } from './refresh-token.service';

jest.mock('@util', () => ({
  getStoragePath: jest.fn(),
}));

import { getStoragePath } from '@util';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'wm-refresh-'));
    (getStoragePath as jest.Mock).mockReturnValue(tempDir);
    service = new RefreshTokenService();
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('consumes token once and detects replay', async () => {
    const { token } = await service.create('user1');

    const consumed = await service.consumeForRotation(token);
    expect(consumed.kind).toBe('ok');
    if (consumed.kind !== 'ok') return;

    await service.commitConsume(consumed.session);

    const replay = await service.consumeForRotation(token);
    expect(replay.kind).toBe('reused');
  });

  it('rolls back consumed token when rotation fails', async () => {
    const { token } = await service.create('user1');

    const consumed = await service.consumeForRotation(token);
    expect(consumed.kind).toBe('ok');
    if (consumed.kind !== 'ok') return;

    await service.rollbackConsume(consumed.session);
    const found = await service.find(token);
    expect(found).not.toBeNull();
  });
});
