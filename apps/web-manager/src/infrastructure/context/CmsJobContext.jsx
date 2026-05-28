import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { databaseJobApi } from '../../features/database/databaseJobApi';
import { runCmsJobInBackground, isCmsJobPolling } from '../services/cmsJobRunner';
import { useToast } from '../hooks/useToast';
import { useCM } from '../../constants/useCM';
import {
  getCmsJobTypeLabel,
  isTerminalCmsJobStatus,
} from '../cmsJob/cmsJobLabels';
import { normalizeTrackedJob } from '../cmsJob/cmsJobUtils';

export const CmsJobContext = createContext(null);

const MAX_TRACKED = 50;

function sortJobs(a, b) {
  const ta = a.createdAt || '';
  const tb = b.createdAt || '';
  return tb.localeCompare(ta);
}

export function CmsJobProvider({ children }) {
  const CM = useCM();
  const toast = useToast();
  const { isAuthenticated } = useSelector((state) => state.auth, shallowEqual);
  const [jobs, setJobs] = useState([]);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const trackingRef = useRef(new Set());

  const upsertJob = useCallback((jobId, patch) => {
    setJobs((prev) => {
      const idx = prev.findIndex((j) => j.jobId === jobId);
      const next =
        idx >= 0
          ? { ...prev[idx], ...patch, jobId }
          : { jobId, dismissed: false, ...patch };
      const list = idx >= 0 ? prev.map((j, i) => (i === idx ? next : j)) : [next, ...prev];
      return list.sort(sortJobs).slice(0, MAX_TRACKED);
    });
  }, []);

  const notifyTerminal = useCallback(
    (job, { notify, successMessage, errorMessage }) => {
      if (notify === false) return;
      const op = getCmsJobTypeLabel(job.type, CM);
      const db = job.dbname || '—';
      if (job.jobStatus === 'succeeded') {
        toast.success(successMessage || CM.jobNotifySucceeded(op, db), { duration: 5000 });
      } else if (job.jobStatus === 'failed') {
        const msg =
          errorMessage ||
          job.error?.message ||
          CM.jobNotifyFailed(op, db);
        toast.error(msg, { duration: 6000 });
      }
    },
    [CM, toast]
  );

  const startTracking = useCallback(
    async (jobId, options = {}) => {
      if (!jobId) {
        throw new Error('Job id is required');
      }

      if (trackingRef.current.has(jobId) || isCmsJobPolling(jobId)) {
        return runCmsJobInBackground(jobId, {
          intervalMs: 3000,
          onUpdate: (serverJob) => {
            const normalized = normalizeTrackedJob(serverJob);
            upsertJob(jobId, normalized);
            if (options.onProgress) options.onProgress(serverJob);
          },
        });
      }

      trackingRef.current.add(jobId);
      const {
        onProgress,
        notify = true,
        successMessage,
        errorMessage,
        initialJob,
      } = options;

      const onUpdate = (serverJob) => {
        const normalized = normalizeTrackedJob(serverJob);
        upsertJob(jobId, normalized);
        if (onProgress) {
          try {
            onProgress(serverJob);
          } catch {
            // Modal closed — background tracking continues.
          }
        }
      };

      if (initialJob) {
        onUpdate(initialJob);
      } else {
        try {
          const snapshot = await databaseJobApi.getJob(jobId);
          onUpdate(snapshot);
        } catch {
          upsertJob(jobId, { jobStatus: 'queued' });
        }
      }

      const existing = isCmsJobPolling(jobId);
      const pollPromise = runCmsJobInBackground(jobId, {
        intervalMs: 3000,
        onUpdate,
      });

      try {
        const result = await pollPromise;
        const final = normalizeTrackedJob(result);
        upsertJob(jobId, final);
        notifyTerminal(final, { notify, successMessage, errorMessage });
        return result;
      } catch (err) {
        setJobs((prev) => {
          const cur = prev.find((j) => j.jobId === jobId);
          const failed = normalizeTrackedJob(
            { ...(cur || {}), jobId, jobStatus: 'failed', error: { message: err?.message } },
            cur || {}
          );
          notifyTerminal(failed, { notify, successMessage, errorMessage });
          return prev.map((j) => (j.jobId === jobId ? { ...j, ...failed } : j));
        });
        throw err;
      } finally {
        trackingRef.current.delete(jobId);
      }
    },
    [notifyTerminal, upsertJob]
  );

  const trackJob = useCallback(
    (jobId, options) => startTracking(jobId, options),
    [startTracking]
  );

  const runJob = useCallback(
    async (submitFn, options = {}) => {
      const created = await submitFn();
      const jobId = created?.jobId;
      if (!jobId) {
        throw new Error('Server did not return a job id');
      }
      return startTracking(jobId, options);
    },
    [startTracking]
  );

  const dismissJob = useCallback((jobId) => {
    setJobs((prev) =>
      prev.map((j) => (j.jobId === jobId ? { ...j, dismissed: true } : j))
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setJobs((prev) => prev.filter((j) => !isTerminalCmsJobStatus(j.jobStatus)));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setJobs([]);
      trackingRef.current.clear();
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const active = await databaseJobApi.listActive();
        if (cancelled) return;
        for (const job of active) {
          const status = normalizeTrackedJob(job).jobStatus;
          if (!isTerminalCmsJobStatus(status)) {
            upsertJob(job.jobId, normalizeTrackedJob(job));
            startTracking(job.jobId, {
              notify: true,
              initialJob: job,
            }).catch(() => {});
          }
        }
      } catch {
        // ignore — user may not have active jobs endpoint yet
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, startTracking, upsertJob]);

  const visibleJobs = useMemo(
    () => jobs.filter((j) => !j.dismissed),
    [jobs]
  );

  const activeCount = useMemo(
    () =>
      visibleJobs.filter(
        (j) => j.jobStatus === 'queued' || j.jobStatus === 'running'
      ).length,
    [visibleJobs]
  );

  useEffect(() => {
    if (activeCount > 0) {
      setPanelExpanded(true);
    }
  }, [activeCount]);

  const value = useMemo(
    () => ({
      jobs: visibleJobs,
      allJobs: jobs,
      activeCount,
      panelExpanded,
      setPanelExpanded,
      runJob,
      trackJob,
      dismissJob,
      clearCompleted,
    }),
    [
      visibleJobs,
      jobs,
      activeCount,
      panelExpanded,
      runJob,
      trackJob,
      dismissJob,
      clearCompleted,
    ]
  );

  return <CmsJobContext.Provider value={value}>{children}</CmsJobContext.Provider>;
}

export function useCmsJobs() {
  const ctx = useContext(CmsJobContext);
  if (!ctx) {
    throw new Error('useCmsJobs must be used within CmsJobProvider');
  }
  return ctx;
}
