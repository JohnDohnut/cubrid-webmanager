/** Default max wait for CMS long-running tasks (unload/load/create/…). */
export const CMS_JOB_LONG_TIMEOUT_HOURS_DEFAULT = 12;

export function getLongJobCmsTimeoutMs(): number {
  const hours = Number(
    process.env.CMS_JOB_LONG_TIMEOUT_HOURS ?? CMS_JOB_LONG_TIMEOUT_HOURS_DEFAULT
  );
  if (!Number.isFinite(hours) || hours <= 0) {
    return CMS_JOB_LONG_TIMEOUT_HOURS_DEFAULT * 60 * 60 * 1000;
  }
  return hours * 60 * 60 * 1000;
}
