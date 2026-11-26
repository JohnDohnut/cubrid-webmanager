// POC (HA slave add): pieces shared by the wizard's connection checks and its progress view.

export const STATE_STYLE = {
  ok: 'text-emerald-600',
  running: 'text-amber-500',
  success: 'text-emerald-600',
  done: 'text-emerald-600',
  fail: 'text-rose-500',
  failed: 'text-rose-500',
  rollback_failed: 'text-rose-500',
  rollback_blocked: 'text-rose-500',
  interrupted: 'text-rose-500',
  cancelled: 'text-slate-500',
  skipped: 'text-slate-400',
  rolled_back: 'text-slate-500',
  pending: 'text-slate-400',
};

// How a job ends (ha_add_nodes_status job_status): done, or failed / cancelled and undone (or not
// entirely), or stopped: its script gone mid-way (interrupted), or a command that did not answer so
// nothing was undone on top of it (rollback_blocked); those two are undone on request.
export const TERMINAL_JOB_STATES = new Set(['success', 'fail', 'cancelled', 'interrupted', 'rolled_back', 'rollback_failed', 'rollback_blocked']);
export const UNDO_ON_REQUEST = new Set(['interrupted', 'rollback_blocked']);

/**
 * A plan check's failure split by path where CMS lists them ("<node> cannot
 * write: <path> (<why>) <path> (<why>) ..."): [{ path, why }], or null when
 * the text has another form (it is then shown as it is).
 */
export function pathProblems(detail) {
  const text = String(detail ?? '');
  const at = text.indexOf('cannot write:');
  if (at < 0) return null;
  const found = [...text.slice(at + 'cannot write:'.length).matchAll(/(\/\S+) \(([^)]*)\)/g)].map((m) => ({ path: m[1], why: m[2] }));
  return found.length > 0 ? found : null;
}

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
