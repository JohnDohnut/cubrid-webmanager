import React, { useEffect, useRef, useState } from 'react';
import { hostApi } from '../../hostApi';
import { Button } from '../../../../components/ds/foundation/Button';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { STATE_STYLE, UNDO_ON_REQUEST, errorText, isJobLive, isPromoteStep } from './haPocShared';
import { useHaJobPolling } from './useHaJobPolling';
import StageSteps from './StageSteps';
import SshProblem from './SshProblem';

/**
 * A run's state, its steps under their stage groups, the log and cancel; for
 * a finished run, the cleanup of the old database folders it moved aside on
 * the new nodes (`cleanupNodes`: their logins, which that request needs
 * again). `promoting`: a single server's promotion is part of the run.
 */
export default function HaJobProgress({ hostUid, job, setJob, L, cleanupNodes = [], rollbackNodes = null, promoting = false, causes = {}, sshLabels }) {
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
      const res = await hostApi.haAddNodesCancel(hostUid, job.uuid);
      setJob((prev) => ({ ...prev, phase: res?.phase ?? prev.phase }));
    } catch (err) {
      setJob((prev) => ({ ...prev, requestError: errorText(err) }));
    }
  };
  const cleanupOld = async () => {
    try {
      const res = await hostApi.haAddNodesCleanup(hostUid, job.uuid, cleanupNodes);
      setCleanup({ done: true, res });
    } catch (err) {
      setCleanup({ error: errorText(err) });
    }
  };

  // An interrupted or blocked job is undone from its record on request; then it is polled again.
  const rollback = async () => {
    try {
      await hostApi.haAddNodesRollback(hostUid, job.uuid, rollbackNodes);
      setJob((prev) => ({ ...prev, job_status: 'running', phase: 'rollback', requestError: null }));
    } catch (err) {
      setJob((prev) => ({ ...prev, requestError: errorText(err) }));
    }
  };

  const keptPaths = Array.isArray(job?.kept_db_paths) ? job.kept_db_paths : [];
  const steps = Array.isArray(job?.steps) ? job.steps : [];
  const current = steps.find((step) => String(step.no) === String(job.step_no));
  const currentTitle = current ? current.title || current.id : job.step;
  const where = [job.step_node, job.step_db].filter(Boolean).join(' · ');
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-13">
        <span>
          {L.status}: <span className={STATE_STYLE[job.job_status] ?? ''}>{job.job_status}</span>
          {job.phase ? ` · ${L.phase}: ${job.phase}` : ''}
        </span>
        <Button size="sm" variant="secondary" onClick={cancel} disabled={!live || job.phase === 'rollback'}>{L.cancel}</Button>
        {UNDO_ON_REQUEST.has(job.job_status) && rollbackNodes && (
          <Button size="sm" variant="secondary" onClick={rollback}>{L.rollback}</Button>
        )}
      </div>
      {job.job_status === 'interrupted' && <span className="text-13 text-amber-700 dark:text-amber-300">{L.interruptedNote}</span>}
      {job.job_status === 'rollback_blocked' && <span className="text-13 text-amber-700 dark:text-amber-300">{L.blockedNote}</span>}
      {job.step_no && job.step_count ? (
        <span className="text-13">
          {L.stepOf(job.step_no, job.step_count)}, {promoting && isPromoteStep(current) ? `${L.promoteGroup} · ` : ''}{currentTitle}{where ? ` (${where})` : ''}
        </span>
      ) : null}
      {Array.isArray(job.db_names) && job.db_names.length > 0 && (
        <span className="text-13">{L.databases}: {job.db_names.join(', ')}</span>
      )}
      {/* A known cause (or CMS's own action line): the node, the cause and what to do; otherwise CMS's text. */}
      {job.error && sshLabels && (causes[job.error] || job.action) ? (
        <SshProblem node={job.step_node} code={job.error} message={job.message} hint={job.action} causes={causes} labels={sshLabels} testId="ha-job-problem" />
      ) : (job.error || job.message) && (
        <span className="text-13 text-rose-500">{[job.error, job.message].filter(Boolean).join(': ')}</span>
      )}
      {job.downtime_sec !== undefined && job.downtime_sec !== null && job.downtime_sec !== '' && (
        <span className="text-13">{L.downtime(job.downtime_sec)}</span>
      )}
      {Array.isArray(job.nodes) && job.nodes.length > 0 && (
        <span className="text-13">{L.nodes}: {job.nodes.map((n) => `${n.host} (${n.role}${n.new ? `, ${L.newNode}` : ''})`).join(', ')}</span>
      )}
      {job.requestError && <span className="text-13 text-rose-500">{job.requestError}</span>}

      <Typography variant="label">{L.steps}</Typography>
      <StageSteps steps={steps} groups={L.stageGroups} promoting={promoting} states testId="ha-job-steps" />

      {Array.isArray(job.unrestored) && job.unrestored.length > 0 && (
        <div className="flex flex-col gap-1 text-13 p-3 rounded border border-rose-300 bg-rose-50 dark:bg-rose-500/10" data-testid="ha-job-unrestored">
          <Typography variant="label">{L.unrestored}</Typography>
          {job.unrestored.map((item) => (
            <span key={`${item.node}|${item.kind}|${item.path}`} className="font-mono">{item.node} · {item.kind} · {item.path}</span>
          ))}
        </div>
      )}
      {keptPaths.length > 0 && (
        <div className="flex flex-col gap-1 text-13">
          <Typography variant="label">{L.keptDbPaths}</Typography>
          {keptPaths.map((path) => <code key={path} className="font-mono">{path}</code>)}
          {job.job_status === 'success' && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={cleanupOld} disabled={Boolean(cleanup?.done) || cleanupNodes.length === 0}>{L.cleanup}</Button>
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
