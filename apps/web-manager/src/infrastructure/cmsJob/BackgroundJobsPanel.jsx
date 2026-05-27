import React from 'react';
import { Icon } from '../../components/ds/foundation/Icon';
import { Typography } from '../../components/ds/foundation/Typography';
import { useCM } from '../../constants/useCM';
import {
  getCmsJobTypeLabel,
  getCmsJobStatusLabel,
  isTerminalCmsJobStatus,
} from './cmsJobLabels';

function StatusBadge({ status, CM }) {
  const base = 'text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full';
  if (status === 'succeeded') {
    return (
      <span className={`${base} bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300`}>
        {getCmsJobStatusLabel(status, CM)}
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className={`${base} bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300`}>
        {getCmsJobStatusLabel(status, CM)}
      </span>
    );
  }
  if (status === 'running') {
    return (
      <span className={`${base} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200`}>
        {getCmsJobStatusLabel(status, CM)}
      </span>
    );
  }
  return (
    <span className={`${base} bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300`}>
      {getCmsJobStatusLabel(status, CM)}
    </span>
  );
}

function JobRow({ job, CM, onDismiss }) {
  const isActive = job.jobStatus === 'queued' || job.jobStatus === 'running';
  const op = getCmsJobTypeLabel(job.type, CM);

  return (
    <li className="flex items-start gap-3 px-3 py-2.5 border-b border-slate-100 dark:border-white/5 last:border-0">
      <div className="mt-0.5 shrink-0">
        {isActive ? (
          <span className="inline-flex h-5 w-5 items-center justify-center">
            <Icon name="sync" className="text-amber-500 animate-spin" size="sm" weight={300} />
          </span>
        ) : job.jobStatus === 'succeeded' ? (
          <Icon name="check_circle" className="text-green-500" size="sm" weight={300} />
        ) : (
          <Icon name="error" className="text-red-500" size="sm" weight={300} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Typography variant="p" className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
          {op}
        </Typography>
        <Typography variant="p" className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {job.dbname || '—'}
        </Typography>
        {job.jobStatus === 'failed' && job.error?.message && (
          <Typography variant="p" className="text-xs text-red-600 dark:text-red-400 mt-1 line-clamp-2">
            {job.error.message}
          </Typography>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <StatusBadge status={job.jobStatus} CM={CM} />
        {isTerminalCmsJobStatus(job.jobStatus) && (
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            onClick={() => onDismiss(job.jobId)}
            aria-label={CM.close}
          >
            <Icon name="close" size="sm" weight={300} />
          </button>
        )}
      </div>
    </li>
  );
}

export function BackgroundJobsPanel({
  jobs,
  activeCount,
  expanded,
  onToggleExpanded,
  onDismiss,
  onClearCompleted,
}) {
  const CM = useCM();
  const hasCompleted = jobs.some((j) => isTerminalCmsJobStatus(j.jobStatus));

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onToggleExpanded}
        className="fixed bottom-4 left-4 z-[9998] flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-bk-side text-slate-800 dark:text-slate-100 pointer-events-auto hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
      >
        {activeCount > 0 ? (
          <Icon name="sync" className="text-amber-500 animate-spin" size="sm" weight={300} />
        ) : (
          <Icon name="pending_actions" className="text-slate-500" size="sm" weight={300} />
        )}
        <span className="text-sm font-medium">
          {activeCount > 0 ? CM.backgroundJobsRunning(activeCount) : CM.backgroundJobsTitle}
        </span>
        <Icon name="expand_less" size="sm" weight={300} className="text-slate-400" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-4 left-4 z-[9998] w-[min(100vw-2rem,360px)] max-h-[min(50vh,420px)] flex flex-col rounded-xl shadow-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-bk-side pointer-events-auto overflow-hidden"
      role="region"
      aria-label={CM.backgroundJobsTitle}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-white/5">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="pending_actions" className="text-amber-500 shrink-0" weight={300} />
          <Typography variant="p" className="text-sm font-semibold truncate">
            {CM.backgroundJobsTitle}
          </Typography>
          {activeCount > 0 && (
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 shrink-0">
              {CM.backgroundJobsRunning(activeCount)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {hasCompleted && (
            <button
              type="button"
              onClick={onClearCompleted}
              className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 rounded"
            >
              {CM.clearCompletedJobs}
            </button>
          )}
          <button
            type="button"
            onClick={onToggleExpanded}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
            aria-label={CM.close}
          >
            <Icon name="expand_more" size="sm" weight={300} />
          </button>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto overscroll-contain">
        {jobs.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-slate-500">{CM.backgroundJobsEmpty}</li>
        ) : (
          jobs.map((job) => (
            <JobRow key={job.jobId} job={job} CM={CM} onDismiss={onDismiss} />
          ))
        )}
      </ul>
    </div>
  );
}
