import { CmsJobStatus } from '@api-interfaces';

/** How long to keep terminal job JSON files after finishedAt (default 24h). */
export function getJobRetentionMs(): number {
  const hours = Number(process.env.CMS_JOB_RETENTION_HOURS ?? 24);
  if (!Number.isFinite(hours) || hours <= 0) {
    return 24 * 60 * 60 * 1000;
  }
  return hours * 60 * 60 * 1000;
}

/** Drop queued/running jobs older than this (default 8h; CMS long timeout is 6h). */
export function getStaleRunningJobMs(): number {
  const hours = Number(process.env.CMS_JOB_STALE_RUNNING_HOURS ?? 8);
  if (!Number.isFinite(hours) || hours <= 0) {
    return 8 * 60 * 60 * 1000;
  }
  return hours * 60 * 60 * 1000;
}

export const CMS_JOB_CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

export function isTerminalJobStatus(status: CmsJobStatus): boolean {
  return status === 'succeeded' || status === 'failed';
}
