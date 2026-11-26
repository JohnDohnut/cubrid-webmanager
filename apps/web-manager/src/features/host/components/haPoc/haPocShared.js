// POC (HA slave add): pieces shared by the wizard's connection checks and its progress view.

export const STATE_STYLE = {
  ok: 'text-emerald-600',
  running: 'text-amber-500',
  success: 'text-emerald-600',
  done: 'text-emerald-600',
  fail: 'text-rose-500',
  failed: 'text-rose-500',
  rollback_failed: 'text-rose-500',
  interrupted: 'text-rose-500',
  cancelled: 'text-slate-500',
  skipped: 'text-slate-400',
  rolled_back: 'text-slate-500',
  pending: 'text-slate-400',
};

export const TERMINAL_JOB_STATES = new Set(['success', 'fail', 'cancelled', 'interrupted']);

/** The steps that promote a single server to an HA master (the convert_* ids). */
export const isPromoteStep = (step) => String(step?.id ?? '').startsWith('convert_');

/** Whether the job still needs polling: running, or ended but still rolling back. */
export const isJobLive = (job) => Boolean(job?.uuid) && (!TERMINAL_JOB_STATES.has(job?.job_status) || job?.phase === 'rollback');

export function errorText(err) {
  return err?.response?.data?.message || err?.message || String(err);
}

let nextNodeId = 1;
/** One node reached over ssh: its inputs, ha_check_ssh's answer, and whether its key was confirmed. */
export const newSshNode = (host = '') => ({
  id: nextNodeId++,
  ssh: { host, sshPort: '22', osUser: '', osPassword: '' },
  check: null, // { result, message, hostkey_sha256, remote_hostname, ... } | { error }
  checking: false,
  accepted: false,
});

/** The connection-check request body for a node (no password, no key). */
export const sshTarget = (ssh) => ({ host: ssh.host.trim(), sshPort: Number(ssh.sshPort) || 22, osUser: ssh.osUser.trim() });

/** Checked over ssh with the confirmed key: the only state that lets the setup start. */
export const isSshConfirmed = (node) => node.accepted
  && node.check?.result === 'ok'
  && Boolean(node.check?.hostkey_sha256)
  && Boolean(node.ssh.osPassword);
