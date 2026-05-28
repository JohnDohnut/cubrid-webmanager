import { pollCmsJob } from '../../features/database/databaseJobApi';

/** @type {Map<string, { cancel: () => void }>} */
const activePolls = new Map();

/**
 * Poll a job until terminal state. Survives React component unmount.
 * @returns {Promise<object>} Resolves with final job record.
 */
export function runCmsJobInBackground(jobId, { intervalMs = 3000, onUpdate } = {}) {
  const existing = activePolls.get(jobId);
  if (existing?.promise) {
    return existing.promise;
  }

  let cancelPoll = null;
  const promise = new Promise((resolve, reject) => {
    const { promise: pollPromise, cancel } = pollCmsJob(jobId, {
      intervalMs,
      onUpdate,
    });
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

  activePolls.set(jobId, { promise, cancel: () => cancelPoll?.() });
  return promise;
}

export function cancelCmsJobPoll(jobId) {
  const entry = activePolls.get(jobId);
  if (!entry) return;
  entry.cancel();
  activePolls.delete(jobId);
}

export function isCmsJobPolling(jobId) {
  return activePolls.has(jobId);
}
