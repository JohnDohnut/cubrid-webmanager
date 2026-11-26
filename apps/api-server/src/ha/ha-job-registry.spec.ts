import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { HaJobRegistry } from './ha-job-registry';

jest.mock('@util', () => ({ getStoragePath: () => (global as any).__haJobDir }));

describe('HaJobRegistry', () => {
  beforeEach(() => {
    (global as any).__haJobDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ha-job-registry-'));
  });
  afterEach(() => {
    fs.rmSync((global as any).__haJobDir, { recursive: true, force: true });
  });

  const record = (uuid: string) => ({ uuid, action: 'run', startedAt: 't', newNodes: [], existingNodes: [] });

  it('keeps the newest runs first, per user and host, and only 20', async () => {
    const reg = new HaJobRegistry();
    expect(await reg.list('u', 'h')).toEqual([]);
    for (let i = 0; i < 22; i += 1) await reg.add('u', 'h', record(`j${i}`));
    const list = await reg.list('u', 'h');
    expect(list).toHaveLength(20);
    expect(list[0].uuid).toBe('j21');
    expect(await reg.list('u', 'other')).toEqual([]);
    expect(await reg.list('v', 'h')).toEqual([]);
  });
});
