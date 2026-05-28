import { pollCmsJob } from '../../features/database/databaseJobApi';

/** @type {Map<string, { promise: Promise<object>, cancel: () => void, onUpdates: Set<Function> }>} */
const activePolls = new Map();

function notifyPollers(jobId, job) {
  const entry = activePolls.get(jobId);
  if (!entry) return;
  for (const onUpdate of entry.onUpdates) {
    try {
      onUpdate(job);
    } catch {
      // Consumer unmounted (e.g. modal closed) — keep polling.
    }
  }
}

/**
 * Poll a job until terminal state. Survives React component unmount.
 * Multiple callers can attach onUpdate handlers for the same jobId.
 * @returns {Promise<object>} Resolves with final job record.
 */
export function runCmsJobInBackground(jobId, { intervalMs = 3000, onUpdate } = {}) {
  const existing = activePolls.get(jobId);
  if (existing?.promise) {
    if (onUpdate) {
      existing.onUpdates.add(onUpdate);
    }
    return existing.promise;
  }

  const onUpdates = new Set();
  if (onUpdate) {
    onUpdates.add(onUpdate);
  }

  let cancelPoll = null;
  const promise = new Promise((resolve, reject) => {
    const { promise: pollPromise, cancel } = pollCmsJob(jobId, {
      intervalMs,
      onUpdate: (job) => notifyPollers(jobId, job),
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

  activePolls.set(jobId, {
    promise,
    onUpdates,
    cancel: () => cancelPoll?.(),
  });
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
