import React, { useEffect, useRef, useState } from 'react';
import { hostApi } from '../hostApi';
import { Input } from '../../../components/ds/forms/Input';
import { Checkbox } from '../../../components/ds/forms/Checkbox';
import { Button } from '../../../components/ds/foundation/Button';
import { Typography } from '../../../components/ds/foundation/Typography';
import { useCM } from '../../../constants/useCM';

// POC (HA slave setup demo): run on the slave host, ssh to the master, then
// ha_make_slavedb.sh with its own variables. The password stays in this
// component's state and goes only into the requests; nothing is saved.

const POLL_MS = 1000;
const SSH_FIELDS = [
  { key: 'masterHost' },
  { key: 'sshPort', type: 'number' },
  { key: 'osUser', autoComplete: 'off' },
  { key: 'osPassword', type: 'password', autoComplete: 'new-password' },
];
// ha_make_slavedb.sh's variables (target_host, db_name, repl_log_home, ...).
const VAR_FIELDS = ['targetHost', 'dbName', 'replLogHome', 'backupDestPath', 'backupOption', 'restoreOption', 'scpOption'];
const TERMINAL = new Set(['success', 'fail', 'failure', 'cancelled', 'canceled', 'done', 'error']);

function errorText(err) {
  return err?.response?.data?.message || err?.message || String(err);
}

export default function HaMakeSlavePoc({ hostUid }) {
  const CM = useCM();
  const L = CM.haSlavePoc;

  const [ssh, setSsh] = useState({ masterHost: '', sshPort: '22', osUser: '', osPassword: '' });
  const [check, setCheck] = useState(null); // { ok, fingerprint, message } | { error }
  const [checking, setChecking] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const [vars, setVars] = useState({
    targetHost: '', dbName: '', replLogHome: '', backupDestPath: '', backupOption: '', restoreOption: '', scpOption: '',
  });
  const [job, setJob] = useState(null); // { uuid, status, output, offset, error }
  const [starting, setStarting] = useState(false);
  const outputRef = useRef(null);

  const sshTarget = () => ({ ...ssh, sshPort: Number(ssh.sshPort) || 22 });
  const setSshField = (key) => (e) => {
    setSsh((prev) => ({ ...prev, [key]: e.target.value }));
    // Another master or account: the earlier check and the accepted key no longer apply.
    setCheck(null);
    setAccepted(false);
  };
  const setVar = (key) => (e) => setVars((prev) => ({ ...prev, [key]: e.target.value }));

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

  const runScript = async () => {
    setStarting(true);
    try {
      const body = { ...sshTarget(), hostKeyFingerprint: check?.fingerprint ?? '' };
      for (const [key, value] of Object.entries(vars)) {
        if (value.trim() !== '') body[key] = value.trim();
      }
      const res = await hostApi.haSlavePocStart(hostUid, body);
      setJob({ uuid: res?.uuid, status: 'running', output: '', offset: 0 });
    } catch (err) {
      setJob({ status: 'error', output: '', offset: 0, error: errorText(err) });
    } finally {
      setStarting(false);
    }
  };

  const cancelScript = async () => {
    if (!job?.uuid) return;
    try {
      await hostApi.haSlavePocCancel(hostUid, job.uuid);
    } catch (err) {
      setJob((prev) => ({ ...prev, error: errorText(err) }));
    }
  };

  const running = Boolean(job?.uuid) && !TERMINAL.has(job?.status);
  const uuid = job?.uuid;

  // Polls the script's state and new output while it runs.
  useEffect(() => {
    if (!running || !uuid) return undefined;
    let stopped = false;
    let offset = 0;
    const timer = setInterval(async () => {
      try {
        const res = await hostApi.haSlavePocStatus(hostUid, uuid, offset);
        if (stopped) return;
        const chunk = typeof res?.output === 'string' ? res.output : '';
        offset = Number.isInteger(res?.offset) ? res.offset : offset + chunk.length;
        setJob((prev) => (prev?.uuid === uuid
          ? { ...prev, status: res?.status ?? prev.status, output: prev.output + chunk, offset, exitCode: res?.exitCode }
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

  // Keeps the newest output in view.
  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [job?.output]);

  const checkOk = Boolean(check?.ok) && Boolean(check?.fingerprint);
  const sshFilled = ssh.masterHost && ssh.osUser && ssh.osPassword;
  const canRun = checkOk && accepted && vars.targetHost.trim() && vars.dbName.trim() && !running && !starting;

  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-6 max-w-4xl">
      <section className="flex flex-col gap-3">
        <Typography variant="h3">{L.sshSection}</Typography>
        <div className="grid grid-cols-2 gap-3">
          {SSH_FIELDS.map(({ key, type, autoComplete }) => (
            <Input key={key} label={L[key]} type={type} value={ssh[key]} onChange={setSshField(key)} autoComplete={autoComplete} />
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
        <Typography variant="h3">{L.scriptSection}</Typography>
        {!(checkOk && accepted) && <span className="text-13 text-slate-500">{L.needCheck}</span>}
        <div className="grid grid-cols-2 gap-3">
          {VAR_FIELDS.map((key) => (
            <Input key={key} label={L[key]} value={vars[key]} onChange={setVar(key)} />
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={runScript} disabled={!canRun}>{L.run}</Button>
          <Button variant="secondary" onClick={cancelScript} disabled={!running}>{L.cancel}</Button>
        </div>
        {job && (
          <div className="flex flex-col gap-2">
            <span className="text-13">
              {L.status}: {job.status}{job.exitCode !== undefined && job.exitCode !== null ? ` (${job.exitCode})` : ''}
              {job.error ? ` - ${job.error}` : ''}
            </span>
            <Typography variant="label">{L.output}</Typography>
            <pre
              ref={outputRef}
              className="font-mono text-12 bg-slate-900 text-slate-100 p-3 rounded h-96 overflow-auto whitespace-pre-wrap"
            >
              {job.output}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}
