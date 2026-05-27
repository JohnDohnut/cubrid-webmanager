import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { getStoragePath } from '@util';
import { CmsJobRecord } from './cms-job.types';
import {
  getJobRetentionMs,
  getStaleRunningJobMs,
  isTerminalJobStatus,
} from './cms-job.cleanup';

@Injectable()
export class CmsJobStore {
  private jobsRoot(): string {
    return path.join(getStoragePath(), 'jobs');
  }

  private userJobsDir(userKey: string): string {
    return path.join(this.jobsRoot(), userKey);
  }

  private jobPath(userKey: string, jobId: string): string {
    return path.join(this.userJobsDir(userKey), `${jobId}.json`);
  }

  private operationsPath(userKey: string): string {
    return path.join(this.jobsRoot(), 'operations', `${userKey}.json`);
  }

  async saveJob(userKey: string, record: CmsJobRecord): Promise<void> {
    const dir = this.userJobsDir(userKey);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.jobPath(userKey, record.jobId), JSON.stringify(record), 'utf8');
  }

  async getJob(userKey: string, jobId: string): Promise<CmsJobRecord | null> {
    try {
      const raw = await fs.readFile(this.jobPath(userKey, jobId), 'utf8');
      return JSON.parse(raw) as CmsJobRecord;
    } catch (err: any) {
      if (err?.code === 'ENOENT') return null;
      throw err;
    }
  }

  async listJobsForUser(userKey: string): Promise<CmsJobRecord[]> {
    const dir = this.userJobsDir(userKey);
    try {
      const files = await fs.readdir(dir);
      const jobs: CmsJobRecord[] = [];
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const raw = await fs.readFile(path.join(dir, file), 'utf8');
        jobs.push(JSON.parse(raw) as CmsJobRecord);
      }
      return jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (err: any) {
      if (err?.code === 'ENOENT') return [];
      throw err;
    }
  }

  async readOperations(userKey: string): Promise<Record<string, string>> {
    try {
      const raw = await fs.readFile(this.operationsPath(userKey), 'utf8');
      return JSON.parse(raw) as Record<string, string>;
    } catch (err: any) {
      if (err?.code === 'ENOENT') return {};
      throw err;
    }
  }

  async writeOperations(userKey: string, ops: Record<string, string>): Promise<void> {
    const file = this.operationsPath(userKey);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(ops), 'utf8');
  }

  async deleteJob(userKey: string, jobId: string): Promise<void> {
    try {
      await fs.unlink(this.jobPath(userKey, jobId));
    } catch (err: any) {
      if (err?.code !== 'ENOENT') throw err;
    }
  }

  private async listUserJobKeys(): Promise<string[]> {
    const root = this.jobsRoot();
    try {
      const entries = await fs.readdir(root);
      const keys: string[] = [];
      for (const name of entries) {
        if (name === 'operations') continue;
        const dir = path.join(root, name);
        try {
          const stat = await fs.stat(dir);
          if (stat.isDirectory()) keys.push(name);
        } catch {
          // skip
        }
      }
      return keys;
    } catch (err: any) {
      if (err?.code === 'ENOENT') return [];
      throw err;
    }
  }

  /**
   * After API server restart, in-memory workers are gone but JSON may still be queued/running.
   * Mark those jobs failed and release operation locks so clients stop polling.
   */
  async failOrphanedActiveJobs(error: {
    message: string;
    code?: string;
  }): Promise<number> {
    const finishedAt = new Date().toISOString();
    let failed = 0;

    for (const userKey of await this.listUserJobKeys()) {
      const jobs = await this.listJobsForUser(userKey);
      for (const job of jobs) {
        if (job.status !== 'queued' && job.status !== 'running') continue;

        job.status = 'failed';
        job.error = { message: error.message, code: error.code };
        job.finishedAt = finishedAt;
        await this.saveJob(userKey, job);
        await this.removeJobIdFromOperations(userKey, job.jobId);
        failed += 1;
      }
    }

    return failed;
  }

  private async removeJobIdFromOperations(userKey: string, jobId: string): Promise<void> {
    const ops = await this.readOperations(userKey);
    let changed = false;
    for (const [key, value] of Object.entries(ops)) {
      if (value === jobId) {
        delete ops[key];
        changed = true;
      }
    }
    if (changed) {
      await this.writeOperations(userKey, ops);
    }
  }

  /**
   * Remove expired terminal jobs and stale queued/running job files.
   * Also clears operation locks that still reference removed job ids.
   */
  async purgeExpiredJobs(
    retentionMs = getJobRetentionMs(),
    staleRunningMs = getStaleRunningJobMs()
  ): Promise<number> {
    const root = this.jobsRoot();
    const now = Date.now();
    let removed = 0;

    let userKeys: string[];
    try {
      userKeys = await fs.readdir(root);
    } catch (err: any) {
      if (err?.code === 'ENOENT') return 0;
      throw err;
    }

    for (const userKey of userKeys) {
      if (userKey === 'operations') continue;

      const dir = path.join(root, userKey);
      let stat;
      try {
        stat = await fs.stat(dir);
      } catch {
        continue;
      }
      if (!stat.isDirectory()) continue;

      let files: string[];
      try {
        files = await fs.readdir(dir);
      } catch {
        continue;
      }

      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const jobId = file.slice(0, -5);
        const filePath = path.join(dir, file);

        let job: CmsJobRecord;
        try {
          const raw = await fs.readFile(filePath, 'utf8');
          job = JSON.parse(raw) as CmsJobRecord;
        } catch {
          await fs.unlink(filePath).catch(() => undefined);
          removed += 1;
          continue;
        }

        let shouldRemove = false;

        if (isTerminalJobStatus(job.status)) {
          const endedAt = job.finishedAt ?? job.createdAt;
          if (now - Date.parse(endedAt) >= retentionMs) {
            shouldRemove = true;
          }
        } else if (job.status === 'queued' || job.status === 'running') {
          if (now - Date.parse(job.createdAt) >= staleRunningMs) {
            shouldRemove = true;
          }
        }

        if (!shouldRemove) continue;

        await fs.unlink(filePath);
        await this.removeJobIdFromOperations(userKey, jobId);
        removed += 1;
      }
    }

    return removed;
  }
}
