import apiClient from '../../api/apiClient';

const ACCEPTED = (status) => status === 202 || (status >= 200 && status < 300);

const JOB_LIFECYCLE_STATUSES = new Set(['queued', 'running', 'succeeded', 'failed']);

/**
 * Resolve job lifecycle status after apiClient envelope unwrap.
 */
export function resolveCmsJobStatus(job) {
  if (!job || typeof job !== 'object') return null;

  const lifecycle =
    (typeof job.jobStatus === 'string' && job.jobStatus) ||
    (typeof job.status === 'string' && JOB_LIFECYCLE_STATUSES.has(job.status) ? job.status : null);

  if (lifecycle && JOB_LIFECYCLE_STATUSES.has(lifecycle)) {
    return lifecycle;
  }

  if (job.finishedAt) {
    return job.error ? 'failed' : 'succeeded';
  }

  return null;
}

export function formatCmsJobError(job) {
  if (job?.error?.message) return job.error.message;
  return 'Job failed';
}

/** Align with api-server CMS long job timeout (default 12h). */
export const CMS_JOB_LONG_TIMEOUT_MS = 12 * 60 * 60 * 1000;

/** Job submit must not use the default 15s client timeout. */
const JOB_SUBMIT_TIMEOUT_MS = CMS_JOB_LONG_TIMEOUT_MS;
/** Per status poll; each GET /jobs/:id should return quickly. */
const JOB_POLL_TIMEOUT_MS = 120_000;

const submitJob = (url, payload) =>
  apiClient.post(url, payload, {
    validateStatus: ACCEPTED,
    timeout: JOB_SUBMIT_TIMEOUT_MS,
  });

/** CMS loaddb expects user, _DBID, and _DBPASSWD together. */
export function buildLoadDatabaseCredentials(username, password) {
  const id = String(username ?? 'dba').trim() || 'dba';
  return {
    user: id,
    _DBID: id,
    _DBPASSWD: password != null ? String(password) : '',
  };
}

export const databaseJobApi = {
  getJob: async (jobId) => {
    const job = await apiClient.get(`/jobs/${jobId}`, { timeout: JOB_POLL_TIMEOUT_MS });
    const resolved = resolveCmsJobStatus(job);
    return resolved ? { ...job, jobStatus: resolved } : job;
  },

  listActive: () => apiClient.get('/jobs/active', { timeout: JOB_POLL_TIMEOUT_MS }),

  submitUnload: (hostUid, dbname, payload) =>
    submitJob(`/${hostUid}/database/unload/${encodeURIComponent(dbname)}`, payload),

  submitLoad: (hostUid, dbname, payload) =>
    submitJob(`/${hostUid}/database/load/${encodeURIComponent(dbname)}`, payload),

  submitCreate: (hostUid, payload) =>
    submitJob(`/${hostUid}/database/create`, payload),

  submitOptimize: (hostUid, dbname, payload) =>
    submitJob(`/${hostUid}/database/optimize/${encodeURIComponent(dbname)}`, payload),

  submitCheck: (hostUid, dbname, payload) =>
    submitJob(`/${hostUid}/database/check/${encodeURIComponent(dbname)}`, payload),

  submitCompact: (hostUid, dbname, payload) =>
    submitJob(`/${hostUid}/database/compact/${encodeURIComponent(dbname)}`, payload),

  submitCopy: (hostUid, payload) =>
    submitJob(`/${hostUid}/database/copy`, payload),

  submitAddVol: (hostUid, dbname, payload) =>
    submitJob(`/${hostUid}/database/add-vol/${encodeURIComponent(dbname)}`, payload),

  submitRename: (hostUid, dbname, payload) =>
    submitJob(`/${hostUid}/database/rename/${encodeURIComponent(dbname)}`, payload),
};

/**
 * Poll until job reaches succeeded or failed.
 * @returns {{ promise: Promise<object>, cancel: () => void }}
 */
export function pollCmsJob(jobId, { intervalMs = 3000, onUpdate } = {}) {
  let cancelled = false;
  let timerId = null;

  const cancel = () => {
    cancelled = true;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const promise = new Promise((resolve, reject) => {
    const finish = (fn, value) => {
      cancel();
      fn(value);
    };

    const tick = async () => {
      if (cancelled) return;
      try {
        const job = await databaseJobApi.getJob(jobId);
        if (cancelled) return;
        if (onUpdate) {
          try {
            onUpdate(job);
          } catch {
            // Consumer unmounted (e.g. modal closed) — keep polling.
          }
        }

        const status = resolveCmsJobStatus(job);
        if (status === 'succeeded') {
          finish(resolve, job);
          return;
        }
        if (status === 'failed') {
          finish(reject, new Error(formatCmsJobError(job)));
          return;
        }

        timerId = setTimeout(tick, intervalMs);
      } catch (err) {
        finish(reject, err);
      }
    };
    tick();
  });

  return { promise, cancel };
}
