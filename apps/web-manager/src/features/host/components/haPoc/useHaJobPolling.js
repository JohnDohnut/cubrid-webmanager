import { useEffect } from 'react';
import { hostApi } from '../../hostApi';
import { errorText, isJobLive } from './haPocShared';

const POLL_MS = 1000;

/**
 * Polls a job (plan or run) for its state, its steps, the plan and the log
 * after `offset` while it is live. `job` is the caller's state: { uuid,
 * job_status, phase, steps, log, offset, ... }; each answer is merged into it.
 */
export function useHaJobPolling(hostUid, job, setJob) {
  const live = isJobLive(job);
  const uuid = job?.uuid;
  useEffect(() => {
    if (!live || !uuid) return undefined;
    let stopped = false;
    let offset = 0;
    const timer = setInterval(async () => {
      try {
        const res = await hostApi.haAddNodesStatus(hostUid, uuid, offset);
        if (stopped || !res) return;
        const chunk = typeof res.output === 'string' ? res.output : '';
        const next = Number(res.next_offset);
        offset = Number.isFinite(next) ? next : offset + chunk.length;
        setJob((prev) => (prev?.uuid === uuid
          ? {
            ...prev,
            ...res,
            steps: Array.isArray(res.steps) ? res.steps : prev.steps,
            log: prev.log + chunk,
            offset,
          }
          : prev));
      } catch (err) {
        if (!stopped) setJob((prev) => (prev?.uuid === uuid ? { ...prev, requestError: errorText(err) } : prev));
      }
    }, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [live, uuid, hostUid, setJob]);
}
