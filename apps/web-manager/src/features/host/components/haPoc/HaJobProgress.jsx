import React, { useEffect, useRef, useState } from 'react';
import { hostApi } from '../../hostApi';
import { Button } from '../../../../components/ds/foundation/Button';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { STATE_STYLE, errorText, isJobLive } from './haPocShared';

const POLL_MS = 1000;

/**
 * Polls the setup's state, its steps and the progress log after `offset`
 * while the job is live. `job` is the caller's state: { uuid, job_status,
 * phase, steps, log, offset, ... }; each answer is merged into it.
 */
function useHaJobPolling(hostUid, job, setJob) {
  const live = isJobLive(job);
  const uuid = job?.uuid;
  useEffect(() => {
    if (!live || !uuid) return undefined;
    let stopped = false;
    let offset = 0;
    const timer = setInterval(async () => {
      try {
        const res = await hostApi.haAddSlaveStatus(hostUid, uuid, offset);
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

/**
 * A job's state, its steps, the log and cancel; for a finished slave add, the
 * cleanup of the old database folders it moved aside on the new slave
 * (`cleanupPassword`, the new slave's, which that request needs again).
 */
export default function HaJobProgress({ hostUid, job, setJob, L, cleanupPassword }) {
  const [cleanup, setCleanup] = useState(null);
  const logRef = useRef(null);
  useHaJobPolling(hostUid, job, setJob);

  // Keeps the newest log line in view.
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [job?.log]);

  const live = isJobLive(job);
  const cancel = async () => {
    try {
      const res = await hostApi.haAddSlaveCancel(hostUid, job.uuid);
      setJob((prev) => ({ ...prev, phase: res?.phase ?? prev.phase }));
    } catch (err) {
      setJob((prev) => ({ ...prev, requestError: errorText(err) }));
    }
  };
  const cleanupOld = async () => {
    try {
      const res = await hostApi.haAddSlaveCleanup(hostUid, job.uuid, cleanupPassword);
      setCleanup({ done: true, res });
    } catch (err) {
      setCleanup({ error: errorText(err) });
    }
  };

  const keptPaths = Array.isArray(job?.kept_db_paths) ? job.kept_db_paths : [];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-13">
        <span>
          {L.status}: <span className={STATE_STYLE[job.job_status] ?? ''}>{job.job_status}</span>
          {job.phase ? ` · ${L.phase}: ${job.phase}` : ''}
          {job.step_no && job.step_count ? ` · ${job.step_no}/${job.step_count}` : ''}
        </span>
        <Button size="sm" variant="secondary" onClick={cancel} disabled={!live || job.phase === 'rollback'}>{L.cancel}</Button>
      </div>
      {(job.error || job.message) && (
        <span className="text-13 text-rose-500">
          {[job.error, job.message].filter(Boolean).join(': ')}
          {job.exit_code !== undefined && job.exit_code !== null && job.exit_code !== '' ? ` (exit ${job.exit_code})` : ''}
        </span>
      )}
      {job.downtime_sec !== undefined && job.downtime_sec !== null && job.downtime_sec !== '' && (
        <span className="text-13">{L.downtime(job.downtime_sec)}</span>
      )}
      {Array.isArray(job.replica_hosts) && job.replica_hosts.length > 0 && (
        <span className="text-13">{L.replicaSection}: {job.replica_hosts.join(', ')}</span>
      )}
      {job.requestError && <span className="text-13 text-rose-500">{job.requestError}</span>}

      <Typography variant="label">{L.steps}</Typography>
      <ol className="flex flex-col gap-1 text-13">
        {(job.steps ?? []).map((step) => (
          <li key={step.id} className="flex gap-3">
            <span className="w-8 shrink-0 text-slate-400">{step.no}</span>
            <span className="w-72 shrink-0">{step.title || step.id}</span>
            <span className={`w-32 shrink-0 ${STATE_STYLE[step.state] ?? ''}`}>{step.state}</span>
            {step.detail && <span className="text-slate-500 truncate" title={step.detail}>{step.detail}</span>}
          </li>
        ))}
      </ol>

      {keptPaths.length > 0 && (
        <div className="flex flex-col gap-1 text-13">
          <Typography variant="label">{L.keptDbPaths}</Typography>
          {keptPaths.map((path) => <code key={path} className="font-mono">{path}</code>)}
          {job.job_status === 'success' && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={cleanupOld} disabled={Boolean(cleanup?.done) || !cleanupPassword}>{L.cleanup}</Button>
              {cleanup?.done && <span className="text-emerald-600">{L.cleanedUp}</span>}
              {cleanup?.error && <span className="text-rose-500">{cleanup.error}</span>}
            </div>
          )}
        </div>
      )}

      <Typography variant="label">{L.log}</Typography>
      <pre
        ref={logRef}
        className="font-mono text-12 bg-slate-900 text-slate-100 p-3 rounded h-80 overflow-auto whitespace-pre-wrap"
      >
        {job.log}
      </pre>
    </div>
  );
}
