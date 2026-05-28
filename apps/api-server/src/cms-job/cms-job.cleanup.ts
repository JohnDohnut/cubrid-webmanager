import { CmsJobStatus } from '@api-interfaces';
import { getLongJobCmsTimeoutMs } from './cms-job.constants';

/** How long to keep terminal job JSON files after finishedAt (default 24h). */
export function getJobRetentionMs(): number {
  const hours = Number(process.env.CMS_JOB_RETENTION_HOURS ?? 24);
  if (!Number.isFinite(hours) || hours <= 0) {
    return 24 * 60 * 60 * 1000;
  }
  return hours * 60 * 60 * 1000;
}

/** Drop queued/running jobs older than this (default: long job timeout + 1h). */
export function getStaleRunningJobMs(): number {
  const defaultHours = getLongJobCmsTimeoutMs() / (60 * 60 * 1000) + 1;
  const hours = Number(process.env.CMS_JOB_STALE_RUNNING_HOURS ?? defaultHours);
  if (!Number.isFinite(hours) || hours <= 0) {
    return getLongJobCmsTimeoutMs() + 60 * 60 * 1000;
  }
  return hours * 60 * 60 * 1000;
}

export const CMS_JOB_CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

export function isTerminalJobStatus(status: CmsJobStatus): boolean {
  return status === 'succeeded' || status === 'failed';
}
