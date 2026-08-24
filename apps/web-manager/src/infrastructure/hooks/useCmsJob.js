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
  // mounted when the job settles, so we know whether its own success/error
  // UI is about to show (dismiss the duplicate global toast) or whether the
  // user already backgrounded it via onBackground/handleClose (leave the
  // global toast as the only notification).
  const isMountedRef = useRef(true);

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
        if (isMountedRef.current) dismissJobResult(capturedJobId);
        return result;
      } catch (err) {
        if (isMountedRef.current) dismissJobResult(capturedJobId);
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

  return { runJob, cancel };
};
