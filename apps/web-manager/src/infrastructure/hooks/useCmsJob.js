import { useCallback, useEffect, useRef } from 'react';
import { cancelCmsJobPoll } from '../services/cmsJobRunner';
import { useCmsJobs } from '../context/CmsJobContext';

/**
 * Run a CMS background job: submit (202 + jobId) then poll until done.
 * Tracking, toasts, and the bottom-left panel are handled by CmsJobProvider.
 */
export function useCmsJob({ cancelOnUnmount = false } = {}) {
  const { runJob: contextRunJob, dismissJobResult } = useCmsJobs();
  const jobIdRef = useRef(null);
  // Tracks whether the component that owns this hook instance is still
  // mounted when the job settles — but these modals are always mounted and
  // just self-gate on `return null` when closed (see App.jsx), so this alone
  // never goes false while the app is open. backgroundedRef is the real
  // signal: the caller must call background() from its onBackground handler
  // to mark "I've hidden my own result UI, let the global toast show".
  const isMountedRef = useRef(true);
  const backgroundedRef = useRef(false);

  useEffect(
    () => () => {
      isMountedRef.current = false;
      if (cancelOnUnmount && jobIdRef.current) {
        cancelCmsJobPoll(jobIdRef.current);
        jobIdRef.current = null;
      }
    },
    [cancelOnUnmount]
  );

  const runJob = useCallback(
    async (submitFn, options = {}) => {
      backgroundedRef.current = false;
      let capturedJobId = null;
      const wrappedSubmit = async () => {
        const created = await submitFn();
        const jobId = created?.jobId;
        if (!jobId) {
          throw new Error('Server did not return a job id');
        }
        jobIdRef.current = jobId;
        capturedJobId = jobId;
        return created;
      };

      try {
        const result = await contextRunJob(wrappedSubmit, options);
        if (isMountedRef.current && !backgroundedRef.current) dismissJobResult(capturedJobId);
        return result;
      } catch (err) {
        if (isMountedRef.current && !backgroundedRef.current) dismissJobResult(capturedJobId);
        throw err;
      } finally {
        jobIdRef.current = null;
      }
    },
    [contextRunJob, dismissJobResult]
  );

  const cancel = useCallback(() => {
    if (jobIdRef.current) {
      cancelCmsJobPoll(jobIdRef.current);
      jobIdRef.current = null;
    }
  }, []);

  // Call from the modal's onBackground handler — marks the in-flight job so
  // its completion isn't suppressed from the global toast/JobResultModal.
  const background = useCallback(() => {
    backgroundedRef.current = true;
  }, []);

  return { runJob, cancel, background };
};
