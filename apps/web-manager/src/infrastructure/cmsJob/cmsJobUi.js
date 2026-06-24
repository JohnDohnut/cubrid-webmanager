/**
 * @param {string} target Database name or operation label
 * @param {string|null|undefined} jobStatus queued | running | …
 * @param {{ cmsJobRunningInBackground: (target: string, statusHint?: string) => string }} CM
 */
export function getCmsJobLoadingSubtitle(target, jobStatus, CM) {
  const statusHint =
    jobStatus === 'running' ? ' (CMS)' : jobStatus === 'queued' ? ' (queued)' : '';
  return CM.cmsJobRunningInBackground(target || '—', statusHint);
}
