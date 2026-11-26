import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { getStoragePath } from '@util';

/** A node of a job as the registry keeps it: how to reach it, never its password. */
export interface HaJobNode {
  role?: 'slave' | 'replica';
  host: string;
  sshPort: number;
  osUser: string;
  hostKeyFingerprint: string;
}

export interface HaJobRecord {
  uuid: string;
  action: string;
  startedAt: string;
  newNodes: HaJobNode[];
  existingNodes: HaJobNode[];
}

const KEEP = 20;

/**
 * POC (HA node add): the runs started on each host, so that a run can be
 * found again after the browser closed (to watch it, or to undo an
 * interrupted one). CMS's status has no list of jobs and does not give the
 * nodes' logins back; this keeps the uuid and each node's address, port,
 * account and host key. Passwords are never written here: an undo asks them
 * again.
 */
@Injectable()
export class HaJobRegistry {
  private file(userId: string, hostUid: string): string {
    const user = createHash('sha256').update(userId).digest('hex');
    return path.join(getStoragePath(), 'ha-poc-jobs', user, `${encodeURIComponent(hostUid)}.json`);
  }

  async list(userId: string, hostUid: string): Promise<HaJobRecord[]> {
    try {
      const raw = await fs.readFile(this.file(userId, hostUid), 'utf8');
      const records = JSON.parse(raw);
      return Array.isArray(records) ? records : [];
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') return [];
      throw err;
    }
  }

  async add(userId: string, hostUid: string, record: HaJobRecord): Promise<void> {
    const file = this.file(userId, hostUid);
    const records = [record, ...(await this.list(userId, hostUid)).filter((r) => r.uuid !== record.uuid)].slice(0, KEEP);
    await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
    await fs.writeFile(file, JSON.stringify(records), { encoding: 'utf8', mode: 0o600 });
  }
}
