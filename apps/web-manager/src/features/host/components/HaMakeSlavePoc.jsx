import React, { useEffect, useRef, useState } from 'react';
import { hostApi } from '../hostApi';
import { Input } from '../../../components/ds/forms/Input';
import { Checkbox } from '../../../components/ds/forms/Checkbox';
import { Button } from '../../../components/ds/foundation/Button';
import { Typography } from '../../../components/ds/foundation/Typography';
import { useCM } from '../../../constants/useCM';

// POC (HA slave setup demo), on the host that becomes the slave. Its CMS
// checks the ssh connection to the master and to each replica
// (ha_check_ssh), then runs the setup step by step itself (ha_make_slave,
// other nodes over ssh). Passwords stay in this component's state and go
// only into the requests made after the user confirmed that node's host
// key; nothing is saved.

const POLL_MS = 1000;
const SSH_FIELDS = [
  { key: 'host' },
  { key: 'sshPort', type: 'number' },
  { key: 'osUser', autoComplete: 'off' },
  { key: 'osPassword', type: 'password', autoComplete: 'new-password' },
];
const SETUP_FIELDS = ['dbName', 'masterNode', 'slaveHost', 'replLogHome', 'masterBackupPath', 'slaveBackupPath'];
const TERMINAL = new Set(['success', 'fail', 'cancelled', 'interrupted']);
const STATE_STYLE = {
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

function errorText(err) {
  return err?.response?.data?.message || err?.message || String(err);
}

let nextNodeId = 1;
/** One node reached over ssh: its inputs, ha_check_ssh's answer, and whether its key was confirmed. */
const newNode = () => ({
  id: nextNodeId++,
  ssh: { host: '', sshPort: '22', osUser: '', osPassword: '' },
  check: null, // { result, message, hostkey_sha256, remote_hostname, ... } | { error }
  checking: false,
  accepted: false,
});
const sshTarget = (ssh) => ({ masterHost: ssh.host.trim(), sshPort: Number(ssh.sshPort) || 22, osUser: ssh.osUser.trim() });
/** Checked over ssh with the confirmed key: the only state that lets the setup start. */
const isConfirmed = (node) => node.accepted && node.check?.result === 'ok' && Boolean(node.check?.hostkey_sha256) && Boolean(node.ssh.osPassword);

/**
 * The inputs and the two-round connection check of one node (the master or a
 * replica): the first round sends no password and returns the host key; the
 * user confirms the key, and the second round logs in with it.
 */
function SshTargetCard({ hostUid, title, node, onChange, onRemove, disabled, L, labels }) {
  const setField = (key) => (e) => onChange({
    ssh: { ...node.ssh, [key]: e.target.value },
    // Another node or account: the earlier check and the accepted key no longer apply.
    check: null,
    accepted: false,
  });

  const callCheck = async (body) => {
    onChange({ checking: true });
    try {
      const res = await hostApi.haSlavePocCheck(hostUid, body);
      onChange({ checking: false, check: res ?? {} });
      return res;
    } catch (err) {
      onChange({ checking: false, check: { error: errorText(err) } });
      return null;
    }
  };

  const runCheck = () => {
    onChange({ accepted: false });
    callCheck(sshTarget(node.ssh));
  };

  const acceptKey = async (e) => {
    const on = e.target.checked;
    onChange({ accepted: on });
    if (!on || !node.check?.hostkey_sha256) return;
    const res = await callCheck({ ...sshTarget(node.ssh), osPassword: node.ssh.osPassword, hostKeyFingerprint: node.check.hostkey_sha256 });
    if (res?.result !== 'ok') onChange({ accepted: false });
  };

  const { check } = node;
  const filled = node.ssh.host.trim() && node.ssh.osUser.trim();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Typography variant="h4">{title}</Typography>
        {onRemove && <Button size="sm" variant="ghost" onClick={onRemove} disabled={disabled}>{L.removeReplica}</Button>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {SSH_FIELDS.map(({ key, type, autoComplete }) => (
          <Input key={key} label={labels[key]} type={type} value={node.ssh[key]} onChange={setField(key)} autoComplete={autoComplete} disabled={disabled} />
        ))}
      </div>
      <div>
        <Button onClick={runCheck} disabled={!filled || node.checking || disabled}>{node.checking ? L.checking : L.check}</Button>
      </div>
      {check && (
        <div className="flex flex-col gap-1 text-13">
          {check.error ? (
            <span className="text-rose-500">{check.error}</span>
          ) : (
            <>
              <span>
                {L.result}: <span className={STATE_STYLE[check.result] ?? 'text-rose-500'}>{check.result}</span>
                {check.message ? ` - ${check.message}` : ''}
              </span>
              {check.hostkey_sha256 && (
                <span>{L.fingerprint}: <code className="font-mono">{check.hostkey_type} {check.hostkey_sha256}</code></span>
              )}
              {check.remote_hostname && <span>{L.remoteHostname}: {check.remote_hostname}</span>}
              {(check.remote_version || check.local_version) && (
                <span>{L.versions}: {check.remote_version ?? '-'} / {check.local_version ?? '-'}</span>
              )}
              {check.remote_cubrid_databases && <span>{L.remoteDatabases}: {check.remote_cubrid_databases}</span>}
              {check.hostkey_sha256 && (
                <Checkbox
                  label={labels.acceptFingerprint}
                  checked={node.accepted}
                  onChange={acceptKey}
                  disabled={disabled || node.checking || !node.ssh.osPassword}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function HaMakeSlavePoc({ hostUid }) {
  const CM = useCM();
  const L = CM.haSlavePoc;
  const masterLabels = { host: L.masterHost, sshPort: L.sshPort, osUser: L.osUser, osPassword: L.osPassword, acceptFingerprint: L.acceptFingerprint };
  const replicaLabels = { host: L.replicaHost, sshPort: L.sshPort, osUser: L.osUser, osPassword: L.osPassword, acceptFingerprint: L.acceptReplicaFingerprint };

  const [master, setMaster] = useState(newNode);
  const [replicas, setReplicas] = useState([]);

  const [setup, setSetup] = useState({
    dbName: '', masterNode: '', slaveHost: '', replLogHome: '', masterBackupPath: '', slaveBackupPath: '',
  });
  const [startHa, setStartHa] = useState(true);
  // { uuid, job_status, phase, steps, log, offset, error, message, exit_code, kept_db_paths, requestError }
  const [job, setJob] = useState(null);
  const [starting, setStarting] = useState(false);
  const [cleanup, setCleanup] = useState(null);
  const logRef = useRef(null);

  const patchMaster = (patch) => {
    setMaster((prev) => ({ ...prev, ...patch }));
    // The master's node name, as ha_node_list names it, from its confirmed check.
    const name = patch.check?.result === 'ok' ? patch.check.remote_hostname : null;
    if (name) setSetup((prev) => (prev.masterNode ? prev : { ...prev, masterNode: name }));
  };
  const patchReplica = (id) => (patch) => setReplicas((prev) => prev.map((node) => (node.id === id ? { ...node, ...patch } : node)));
  const setSetupField = (key) => (e) => setSetup((prev) => ({ ...prev, [key]: e.target.value }));

  const startSetup = async () => {
    setStarting(true);
    setCleanup(null);
    try {
      const body = {
        dbName: setup.dbName.trim(),
        masterHost: setup.masterNode.trim(),
        sshPort: Number(master.ssh.sshPort) || 22,
        osUser: master.ssh.osUser.trim(),
        osPassword: master.ssh.osPassword,
        hostKeyFingerprint: master.check?.hostkey_sha256 ?? '',
        startHa,
      };
      for (const key of ['slaveHost', 'replLogHome', 'masterBackupPath', 'slaveBackupPath']) {
        if (setup[key].trim()) body[key] = setup[key].trim();
      }
      if (replicas.length > 0) {
        body.replicas = replicas.map((node) => ({
          host: node.ssh.host.trim(),
          sshPort: Number(node.ssh.sshPort) || 22,
          osUser: node.ssh.osUser.trim(),
          osPassword: node.ssh.osPassword,
          hostKeyFingerprint: node.check?.hostkey_sha256 ?? '',
        }));
      }
      const res = await hostApi.haSlavePocStart(hostUid, body);
      setJob({ uuid: res?.uuid, job_status: res?.job_status ?? 'running', steps: [], log: '', offset: 0 });
    } catch (err) {
      setJob({ job_status: 'fail', steps: [], log: '', offset: 0, requestError: errorText(err) });
    } finally {
      setStarting(false);
    }
  };

  const cancelSetup = async () => {
    if (!job?.uuid) return;
    try {
      const res = await hostApi.haSlavePocCancel(hostUid, job.uuid);
      setJob((prev) => ({ ...prev, phase: res?.phase ?? prev.phase }));
    } catch (err) {
      setJob((prev) => ({ ...prev, requestError: errorText(err) }));
    }
  };

  const cleanupOld = async () => {
    if (!job?.uuid) return;
    try {
      const res = await hostApi.haSlavePocCleanup(hostUid, job.uuid);
      setCleanup({ done: true, res });
    } catch (err) {
      setCleanup({ error: errorText(err) });
    }
  };

  // Polls until the job ends and its rollback (phase) is done too.
  const running = Boolean(job?.uuid) && (!TERMINAL.has(job?.job_status) || job?.phase === 'rollback');
  const uuid = job?.uuid;

  useEffect(() => {
    if (!running || !uuid) return undefined;
    let stopped = false;
    let offset = 0;
    const timer = setInterval(async () => {
      try {
        const res = await hostApi.haSlavePocStatus(hostUid, uuid, offset);
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
  }, [running, uuid, hostUid]);

  // Keeps the newest log line in view.
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [job?.log]);

  const allConfirmed = isConfirmed(master) && replicas.every(isConfirmed);
  const canStart = allConfirmed && setup.dbName.trim() && setup.masterNode.trim() && !running && !starting;
  const keptPaths = Array.isArray(job?.kept_db_paths) ? job.kept_db_paths : [];

  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-6 max-w-5xl">
      <section className="flex flex-col gap-3">
        <SshTargetCard
          hostUid={hostUid}
          title={L.sshSection}
          node={master}
          onChange={patchMaster}
          disabled={running}
          L={L}
          labels={masterLabels}
        />
      </section>

      <section className="flex flex-col gap-4">
        <Typography variant="h3">{L.replicaSection}</Typography>
        {replicas.map((node, index) => (
          <SshTargetCard
            key={node.id}
            hostUid={hostUid}
            title={L.replicaTitle(index + 1)}
            node={node}
            onChange={patchReplica(node.id)}
            onRemove={() => setReplicas((prev) => prev.filter((r) => r.id !== node.id))}
            disabled={running}
            L={L}
            labels={replicaLabels}
          />
        ))}
        <div>
          <Button variant="secondary" onClick={() => setReplicas((prev) => [...prev, newNode()])} disabled={running}>{L.addReplica}</Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Typography variant="h3">{L.setupSection}</Typography>
        {!allConfirmed && <span className="text-13 text-slate-500">{L.needCheck}</span>}
        <div className="grid grid-cols-2 gap-3">
          {SETUP_FIELDS.map((key) => (
            <Input key={key} label={L[key]} value={setup[key]} onChange={setSetupField(key)} disabled={running} />
          ))}
        </div>
        <Checkbox label={L.startHa} checked={startHa} onChange={(e) => setStartHa(e.target.checked)} disabled={running} />
        <div className="flex gap-2">
          <Button onClick={startSetup} disabled={!canStart}>{L.run}</Button>
          <Button variant="secondary" onClick={cancelSetup} disabled={!running || job?.phase === 'rollback'}>{L.cancel}</Button>
        </div>

        {job && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1 text-13">
              <span>
                {L.status}: <span className={STATE_STYLE[job.job_status] ?? ''}>{job.job_status}</span>
                {job.phase ? ` · ${L.phase}: ${job.phase}` : ''}
                {job.step_no && job.step_count ? ` · ${job.step_no}/${job.step_count}` : ''}
              </span>
              {(job.error || job.message) && (
                <span className="text-rose-500">
                  {[job.error, job.message].filter(Boolean).join(': ')}
                  {job.exit_code !== undefined && job.exit_code !== null && job.exit_code !== '' ? ` (exit ${job.exit_code})` : ''}
                </span>
              )}
              {Array.isArray(job.replica_hosts) && job.replica_hosts.length > 0 && (
                <span>{L.replicaSection}: {job.replica_hosts.join(', ')}</span>
              )}
              {job.requestError && <span className="text-rose-500">{job.requestError}</span>}
            </div>

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
                    <Button size="sm" variant="secondary" onClick={cleanupOld} disabled={Boolean(cleanup?.done)}>{L.cleanup}</Button>
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
        )}
      </section>
    </div>
  );
}
