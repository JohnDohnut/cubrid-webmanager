import { pollCmsJob } from '../../features/database/databaseJobApi';

const CANCELLED_ERROR = Object.assign(new Error('Polling cancelled'), { cancelled: true });

/** @type {Map<string, { promise: Promise, cancel: () => void, reject: (err: Error) => void }>} */
const activePolls = new Map();

/**
 * Poll a job until terminal state. Survives React component unmount.
 * @returns {Promise<object>} Resolves with final job record.
 */
export function runCmsJobInBackground(jobId, { onUpdate } = {}) {
  const existing = activePolls.get(jobId);
  if (existing?.promise) {
    return existing.promise;
  }

  let cancelPoll = null;
  let rejectOuter = null;

  const promise = new Promise((resolve, reject) => {
    rejectOuter = reject;
    const { promise: pollPromise, cancel } = pollCmsJob(jobId, { onUpdate });
    cancelPoll = cancel;

    pollPromise
      .then((job) => {
        activePolls.delete(jobId);
        resolve(job);
      })
      .catch((err) => {
        activePolls.delete(jobId);
        reject(err);
      });
  });

  activePolls.set(jobId, {
    promise,
    cancel: () => cancelPoll?.(),
    reject: (err) => rejectOuter?.(err),
  });
  return promise;
}

export function cancelCmsJobPoll(jobId) {
  const entry = activePolls.get(jobId);
  if (!entry) return;
  entry.cancel();
  entry.reject(CANCELLED_ERROR);
  activePolls.delete(jobId);
}

export function isCmsJobPolling(jobId) {
  return activePolls.has(jobId);
}

export function cancelAllCmsJobPolls() {
  for (const entry of activePolls.values()) {
    entry.cancel();
    entry.reject(CANCELLED_ERROR);
  }
  activePolls.clear();
}
