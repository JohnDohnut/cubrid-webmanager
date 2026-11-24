import React, { useEffect, useRef, useState } from 'react';
import { hostApi } from '../hostApi';
import { Input } from '../../../components/ds/forms/Input';
import { Checkbox } from '../../../components/ds/forms/Checkbox';
import { Button } from '../../../components/ds/foundation/Button';
import { Typography } from '../../../components/ds/foundation/Typography';
import { useCM } from '../../../constants/useCM';

// POC (HA slave setup demo), on the host that becomes the slave: check the
// ssh connection to the master and its host key, then this host's CMS runs
// the setup step by step (master side over ssh, this host locally). The
// password stays in this component's state and goes only into the
// requests; nothing is saved.

const POLL_MS = 1000;
const SSH_FIELDS = [
  { key: 'masterHost' },
  { key: 'sshPort', type: 'number' },
  { key: 'osUser', autoComplete: 'off' },
  { key: 'osPassword', type: 'password', autoComplete: 'new-password' },
];
const SETUP_FIELDS = ['dbName', 'replLogHome', 'backupDestPath', 'replicaHosts'];
// The steps in order; the CMS task reports each by these ids. A step it
// reports under another id is shown after these, under its own name.
const STEP_IDS = ['backup', 'transfer', 'archive', 'restore', 'firstCopy', 'masterSetup', 'slaveHaStart'];
const TERMINAL = new Set(['success', 'fail', 'failure', 'cancelled', 'canceled', 'done', 'error']);
const STATE_STYLE = {
  running: 'text-amber-500',
  success: 'text-emerald-600',
  done: 'text-emerald-600',
  fail: 'text-rose-500',
  failure: 'text-rose-500',
  error: 'text-rose-500',
  cancelled: 'text-slate-500',
  canceled: 'text-slate-500',
  rolledback: 'text-slate-500',
};

function errorText(err) {
  return err?.response?.data?.message || err?.message || String(err);
}

/** The step list to show: the known steps in order, then any others the task reported. */
function stepRows(reported) {
  const byId = new Map((Array.isArray(reported) ? reported : []).map((step) => [step.id, step]));
  const rows = STEP_IDS.map((id) => ({ id, state: 'pending', ...byId.get(id) }));
  for (const step of byId.values()) {
    if (!STEP_IDS.includes(step.id)) rows.push(step);
  }
  return rows;
}

export default function HaMakeSlavePoc({ hostUid }) {
  const CM = useCM();
  const L = CM.haSlavePoc;

  const [ssh, setSsh] = useState({ masterHost: '', sshPort: '22', osUser: '', osPassword: '' });
  const [check, setCheck] = useState(null); // { ok, fingerprint, message } | { error }
  const [checking, setChecking] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const [setup, setSetup] = useState({ dbName: '', replLogHome: '', backupDestPath: '', replicaHosts: '' });
  // { uuid, status, steps, log, offset, rollback, error }
  const [job, setJob] = useState(null);
  const [starting, setStarting] = useState(false);
  const logRef = useRef(null);

  const sshTarget = () => ({ ...ssh, sshPort: Number(ssh.sshPort) || 22 });
  const setSshField = (key) => (e) => {
    setSsh((prev) => ({ ...prev, [key]: e.target.value }));
    // Another master or account: the earlier check and the accepted key no longer apply.
    setCheck(null);
    setAccepted(false);
  };
  const setSetupField = (key) => (e) => setSetup((prev) => ({ ...prev, [key]: e.target.value }));

  const runCheck = async () => {
    setChecking(true);
    setCheck(null);
    setAccepted(false);
    try {
      const res = await hostApi.haSlavePocCheck(hostUid, sshTarget());
      setCheck(res ?? {});
    } catch (err) {
      setCheck({ error: errorText(err) });
    } finally {
      setChecking(false);
    }
  };

  const startSetup = async () => {
    setStarting(true);
    try {
      const body = { ...sshTarget(), hostKeyFingerprint: check?.fingerprint ?? '', dbName: setup.dbName.trim() };
      if (setup.replLogHome.trim()) body.replLogHome = setup.replLogHome.trim();
      if (setup.backupDestPath.trim()) body.backupDestPath = setup.backupDestPath.trim();
      const replicas = setup.replicaHosts.split(',').map((host) => host.trim()).filter(Boolean);
      if (replicas.length > 0) body.replicaHosts = replicas;
      const res = await hostApi.haSlavePocStart(hostUid, body);
      setJob({ uuid: res?.uuid, status: 'running', steps: [], log: '', offset: 0 });
    } catch (err) {
      setJob({ status: 'error', steps: [], log: '', offset: 0, error: errorText(err) });
    } finally {
      setStarting(false);
    }
  };

  const cancelSetup = async () => {
    if (!job?.uuid) return;
    try {
      await hostApi.haSlavePocCancel(hostUid, job.uuid);
    } catch (err) {
      setJob((prev) => ({ ...prev, error: errorText(err) }));
    }
  };

  const running = Boolean(job?.uuid) && !TERMINAL.has(job?.status);
  const uuid = job?.uuid;

  // Polls the setup's state, step states and new log while it runs.
  useEffect(() => {
    if (!running || !uuid) return undefined;
    let stopped = false;
    let offset = 0;
    const timer = setInterval(async () => {
      try {
        const res = await hostApi.haSlavePocStatus(hostUid, uuid, offset);
        if (stopped) return;
        const chunk = typeof res?.log === 'string' ? res.log : '';
        offset = Number.isInteger(res?.offset) ? res.offset : offset + chunk.length;
        setJob((prev) => (prev?.uuid === uuid
          ? {
            ...prev,
            status: res?.status ?? prev.status,
            steps: Array.isArray(res?.steps) ? res.steps : prev.steps,
            log: prev.log + chunk,
            offset,
            rollback: res?.rollback ?? prev.rollback,
          }
          : prev));
      } catch (err) {
        if (!stopped) setJob((prev) => (prev?.uuid === uuid ? { ...prev, status: 'error', error: errorText(err) } : prev));
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

  const checkOk = Boolean(check?.ok) && Boolean(check?.fingerprint);
  const sshFilled = ssh.masterHost && ssh.osUser && ssh.osPassword;
  const canStart = checkOk && accepted && setup.dbName.trim() && !running && !starting;
  const rollback = job?.rollback;

  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-6 max-w-4xl">
      <section className="flex flex-col gap-3">
        <Typography variant="h3">{L.sshSection}</Typography>
        <div className="grid grid-cols-2 gap-3">
          {SSH_FIELDS.map(({ key, type, autoComplete }) => (
            <Input key={key} label={L[key]} type={type} value={ssh[key]} onChange={setSshField(key)} autoComplete={autoComplete} disabled={running} />
          ))}
        </div>
        <div>
          <Button onClick={runCheck} disabled={!sshFilled || checking || running}>{L.check}</Button>
        </div>
        {check && (
          <div className="flex flex-col gap-2 text-13">
            {check.error ? (
              <span className="text-rose-500">{L.failed}: {check.error}</span>
            ) : (
              <>
                <span className={check.ok ? 'text-emerald-600' : 'text-rose-500'}>
                  {check.ok ? L.connected : L.failed}{check.message ? `: ${check.message}` : ''}
                </span>
                {check.fingerprint && (
                  <>
                    <span>{L.fingerprint}: <code className="font-mono">{check.fingerprint}</code></span>
                    <Checkbox label={L.acceptFingerprint} checked={accepted} onChange={(e) => setAccepted(e.target.checked)} disabled={running} />
                  </>
                )}
              </>
            )}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <Typography variant="h3">{L.setupSection}</Typography>
        {!(checkOk && accepted) && <span className="text-13 text-slate-500">{L.needCheck}</span>}
        <div className="grid grid-cols-2 gap-3">
          {SETUP_FIELDS.map((key) => (
            <Input key={key} label={L[key]} value={setup[key]} onChange={setSetupField(key)} disabled={running} />
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={startSetup} disabled={!canStart}>{L.run}</Button>
          <Button variant="secondary" onClick={cancelSetup} disabled={!running}>{L.cancel}</Button>
        </div>

        {job && (
          <div className="flex flex-col gap-3">
            <span className="text-13">
              {L.status}: <span className={STATE_STYLE[job.status] ?? ''}>{job.status}</span>
              {job.error ? ` - ${job.error}` : ''}
            </span>

            <Typography variant="label">{L.steps}</Typography>
            <ol className="flex flex-col gap-1 text-13">
              {stepRows(job.steps).map((step) => (
                <li key={step.id} className="flex gap-3">
                  <span className="w-72 shrink-0">{L.stepNames[step.id] ?? step.name ?? step.id}</span>
                  <span className={`w-24 shrink-0 ${STATE_STYLE[step.state] ?? 'text-slate-400'}`}>{step.state}</span>
                  {step.message && <span className="text-slate-500 truncate" title={step.message}>{step.message}</span>}
                </li>
              ))}
            </ol>

            {rollback && (
              <div className="flex flex-col gap-1 text-13">
                <Typography variant="label">{L.rollback}</Typography>
                {Array.isArray(rollback)
                  ? rollback.map((item) => (
                    <span key={item.id ?? item.name ?? JSON.stringify(item)}>
                      {item.name ?? item.id}: <span className={STATE_STYLE[item.state] ?? ''}>{item.state}</span>
                      {item.message ? ` - ${item.message}` : ''}
                    </span>
                  ))
                  : <span>{typeof rollback === 'string' ? rollback : JSON.stringify(rollback)}</span>}
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
