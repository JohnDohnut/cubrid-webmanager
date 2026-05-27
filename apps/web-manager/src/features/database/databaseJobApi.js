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

const submitJob = (url, payload) =>
  apiClient.post(url, payload, { validateStatus: ACCEPTED });

export const databaseJobApi = {
  getJob: async (jobId) => {
    const job = await apiClient.get(`/jobs/${jobId}`);
    const resolved = resolveCmsJobStatus(job);
    return resolved ? { ...job, jobStatus: resolved } : job;
  },

  listActive: () => apiClient.get('/jobs/active'),

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
        if (onUpdate) onUpdate(job);

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
