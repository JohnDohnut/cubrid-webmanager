import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { hostApi } from '../../hostApi';
import { monitoringApi } from '../../../server/monitoringApi';
import { extractHaHeartbeatNodes } from '../../haPeerUtils';
import { Input } from '../../../../components/ds/forms/Input';
import { Checkbox } from '../../../../components/ds/forms/Checkbox';
import { Button } from '../../../../components/ds/foundation/Button';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Steps } from '../../../../components/ds/layout/Steps';
import { useCM } from '../../../../constants/useCM';
import { useLatestRef } from '../../../../infrastructure/hooks/useLatestRef';
import SshTargetCard from './SshTargetCard';
import HaJobProgress, { isJobLive } from './HaJobProgress';
import { errorText, isSshConfirmed, newSshNode } from './haPocShared';
import { buildAddSlaveRequest, buildConvertMasterRequest, summarizeRequests } from './addSlaveRequest';

// POC (HA slave add), opened on a database of the master (or of a single,
// non-HA server): this host's CMS builds a new slave on another server over
// ssh. A wizard: target, new slave, replicas, options, summary, progress.
// A single database is first turned into a one-node HA master
// (ha_convert_master, which restarts it); when that succeeds the slave add
// (ha_make_slave) starts on its own. Each step's checks must pass before
// Next; passwords stay in this state and go only into the requests
// (connection check round 2, start, cleanup).

const STEP_TARGET = 0;
const STEP_SLAVE = 1;
const STEP_REPLICAS = 2;
const STEP_OPTIONS = 3;
const STEP_SUMMARY = 4;
const STEP_PROGRESS = 5;
const OPTION_FIELDS = ['replLogHome', 'masterBackupPath', 'slaveBackupPath'];
const newJob = (res) => ({ uuid: res?.uuid, job_status: res?.job_status ?? 'running', steps: [], log: '', offset: 0 });
// Only for a single database's conversion.
const CONVERT_FIELDS = ['haGroup', 'haPortId'];

export default function HaAddSlaveWizard({ hostUid, dbname }) {
  const CM = useCM();
  const L = CM.haSlavePoc;
  const W = CM.haAddSlave;
  const host = useSelector((state) => (state.host.hosts ?? []).find((h) => h.uid === hostUid));
  const isHaDb = useSelector((state) => (state.database.haDbNamesByHost?.[hostUid] ?? []).includes(dbname));

  const [step, setStep] = useState(STEP_TARGET);
  // This host's HA role and the replicas in its node list (heartbeat list, nodes only).
  const [ha, setHa] = useState({ loading: isHaDb, role: null, replicas: [], error: null });
  const [switchConfirmed, setSwitchConfirmed] = useState(false);
  const [slave, setSlave] = useState(() => newSshNode());
  const [replicas, setReplicas] = useState([]);
  const [options, setOptions] = useState({ replLogHome: '', masterBackupPath: '', slaveBackupPath: '', haGroup: '', haPortId: '', startHa: true });
  const [showAdvanced, setShowAdvanced] = useState(false);
  // The conversion's job (single database only), then the slave add's.
  const [convertJob, setConvertJob] = useState(null);
  const [job, setJob] = useState(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);

  useEffect(() => {
    if (!isHaDb) return undefined;
    let cancelled = false;
    monitoringApi.getHaHeartbeatList(hostUid, { nodesOnly: true })
      .then((res) => {
        if (cancelled) return;
        const nodes = extractHaHeartbeatNodes(res);
        const replicaNames = nodes
          .filter((node) => (node.state || '').trim().toLowerCase() === 'replica')
          .map((node) => node.hostname || node.ip)
          .filter(Boolean);
        setHa({ loading: false, role: (res?.currentnodestate || '').trim().toLowerCase(), replicas: replicaNames, error: null });
        // Every replica in the master's list must be given; prefilled and fixed.
        setReplicas(replicaNames.map((name) => ({ ...newSshNode(name), locked: true })));
      })
      .catch((err) => { if (!cancelled) setHa({ loading: false, role: null, replicas: [], error: errorText(err) }); });
    return () => { cancelled = true; };
  }, [hostUid, isHaDb]);

  const patchReplica = (id) => (patch) => setReplicas((prev) => prev.map((node) => (node.id === id ? { ...node, ...patch } : node)));
  const setOption = (key) => (e) => setOptions((prev) => ({ ...prev, [key]: e.target.value }));

  // What each step needs before Next.
  const targetOk = isHaDb ? !ha.loading && !ha.error && ha.role === 'master' : switchConfirmed;
  // The new slave's node name is also the address: it must be that server's uname -n.
  const slaveName = slave.ssh.host.trim();
  const slaveNameMismatch = slave.check?.result === 'ok' && slave.check.remote_hostname && slave.check.remote_hostname !== slaveName;
  const stepOk = {
    [STEP_TARGET]: targetOk,
    [STEP_SLAVE]: isSshConfirmed(slave) && !slaveNameMismatch,
    [STEP_REPLICAS]: replicas.every(isSshConfirmed),
    [STEP_OPTIONS]: true,
    [STEP_SUMMARY]: true,
  };
  const live = isJobLive(job) || isJobLive(convertJob);
  const request = { dbname, slave, replicas, options };

  const startAddSlave = async () => {
    const res = await hostApi.haAddSlaveStart(hostUid, buildAddSlaveRequest(request));
    setJob(newJob(res));
  };

  const start = async () => {
    setStarting(true);
    setStartError(null);
    try {
      if (isHaDb) {
        await startAddSlave();
      } else {
        const res = await hostApi.haAddSlaveConvert(hostUid, buildConvertMasterRequest(request));
        setConvertJob(newJob(res));
      }
      setStep(STEP_PROGRESS);
    } catch (err) {
      setStartError(errorText(err));
    } finally {
      setStarting(false);
    }
  };

  // The conversion done (and nothing left to undo): the slave add follows on its own.
  const convertDone = convertJob?.job_status === 'success' && convertJob?.phase === 'done';
  const [chainError, setChainError] = useState(null);
  // The wizard's state when the conversion finishes (the inputs are locked by then).
  const requestRef = useLatestRef(request);
  const chained = useRef(false);
  useEffect(() => {
    if (!convertDone || chained.current) return;
    chained.current = true;
    hostApi.haAddSlaveStart(hostUid, buildAddSlaveRequest(requestRef.current))
      .then((res) => setJob(newJob(res)))
      .catch((err) => setChainError(errorText(err)));
  }, [convertDone, hostUid, requestRef]);

  const stepNames = [W.stepTarget, W.stepSlave, W.stepReplicas, W.stepOptions, W.stepSummary, W.stepProgress];
  const slaveLabels = { host: W.slaveHost, sshPort: L.sshPort, osUser: L.osUser, osPassword: L.osPassword, acceptFingerprint: W.acceptSlaveFingerprint };
  const replicaLabels = { host: L.replicaHost, sshPort: L.sshPort, osUser: L.osUser, osPassword: L.osPassword, acceptFingerprint: L.acceptReplicaFingerprint };

  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-8 max-w-5xl">
      <div className="pb-6">
        <Steps steps={stepNames} currentStep={step} />
      </div>

      {step === STEP_TARGET && (
        <section className="flex flex-col gap-3 text-13">
          <Typography variant="h3">{W.stepTarget}</Typography>
          <span>{W.database}: <b>{dbname}</b></span>
          <span>{W.host}: {host?.alias || host?.address} ({host?.address}:{host?.port})</span>
          <span>{W.mode}: {isHaDb ? W.modeHa : W.modeSingle}</span>
          {isHaDb && (
            ha.loading ? <span className="text-slate-500">{W.readingHa}</span>
              : ha.error ? <span className="text-rose-500">{ha.error}</span>
                : (
                  <>
                    <span>{W.haRole}: {ha.role || '-'}</span>
                    {ha.role !== 'master' && <span className="text-rose-500">{W.notMaster}</span>}
                    <span>{L.replicaSection}: {ha.replicas.length ? ha.replicas.join(', ') : W.none}</span>
                  </>
                )
          )}
          {!isHaDb && (
            <div className="flex flex-col gap-2 p-3 rounded border border-amber-300 bg-amber-50 dark:bg-amber-500/10">
              <span className="text-amber-700 dark:text-amber-300">{W.singleWarning}</span>
              <Checkbox label={W.singleConfirm} checked={switchConfirmed} onChange={(e) => setSwitchConfirmed(e.target.checked)} />
            </div>
          )}
        </section>
      )}

      {step === STEP_SLAVE && (
        <section className="flex flex-col gap-3">
          <Typography variant="h3">{W.stepSlave}</Typography>
          <span className="text-13 text-slate-500">{W.slaveHostHint}</span>
          <SshTargetCard hostUid={hostUid} node={slave} onChange={(patch) => setSlave((prev) => ({ ...prev, ...patch }))} L={L} labels={slaveLabels} />
          {slaveNameMismatch && <span className="text-13 text-rose-500">{W.slaveNameMismatch(slave.check.remote_hostname)}</span>}
        </section>
      )}

      {step === STEP_REPLICAS && (
        <section className="flex flex-col gap-4">
          <Typography variant="h3">{W.stepReplicas}</Typography>
          {replicas.length === 0 && <span className="text-13 text-slate-500">{W.noReplicas}</span>}
          {replicas.map((node, index) => (
            <SshTargetCard
              key={node.id}
              hostUid={hostUid}
              title={L.replicaTitle(index + 1)}
              node={node}
              onChange={patchReplica(node.id)}
              onRemove={node.locked ? undefined : () => setReplicas((prev) => prev.filter((r) => r.id !== node.id))}
              hostLocked={node.locked}
              L={L}
              labels={replicaLabels}
            />
          ))}
          <div>
            <Button variant="secondary" onClick={() => setReplicas((prev) => [...prev, newSshNode()])}>{L.addReplica}</Button>
          </div>
        </section>
      )}

      {step === STEP_OPTIONS && (
        <section className="flex flex-col gap-3">
          <Typography variant="h3">{W.stepOptions}</Typography>
          <Checkbox label={L.startHa} checked={options.startHa} onChange={(e) => setOptions((prev) => ({ ...prev, startHa: e.target.checked }))} />
          <div>
            <Button size="sm" variant="ghost" onClick={() => setShowAdvanced((v) => !v)}>{showAdvanced ? W.hideAdvanced : W.showAdvanced}</Button>
          </div>
          {showAdvanced && (
            <div className="grid grid-cols-2 gap-3">
              {[...OPTION_FIELDS, ...(isHaDb ? [] : CONVERT_FIELDS)].map((key) => (
                <Input key={key} label={W[key]} value={options[key]} onChange={setOption(key)} type={key === 'haPortId' ? 'number' : 'text'} />
              ))}
            </div>
          )}
        </section>
      )}

      {step === STEP_SUMMARY && (
        <section className="flex flex-col gap-3">
          <Typography variant="h3">{W.stepSummary}</Typography>
          <pre className="font-mono text-12 bg-slate-100 dark:bg-white/5 p-3 rounded overflow-auto">
            {JSON.stringify(summarizeRequests(request, { convert: !isHaDb }), null, 2)}
          </pre>
          {!isHaDb && <span className="text-13 text-amber-700 dark:text-amber-300">{W.singleWarning}</span>}
          {startError && <span className="text-13 text-rose-500">{startError}</span>}
        </section>
      )}

      {step === STEP_PROGRESS && convertJob && (
        <section className="flex flex-col gap-3">
          <Typography variant="h3">{W.convertTitle}</Typography>
          <HaJobProgress hostUid={hostUid} job={convertJob} setJob={setConvertJob} L={L} />
          {chainError && <span className="text-13 text-rose-500">{chainError}</span>}
        </section>
      )}
      {step === STEP_PROGRESS && job && (
        <section className="flex flex-col gap-3">
          <Typography variant="h3">{W.addTitle}</Typography>
          <HaJobProgress hostUid={hostUid} job={job} setJob={setJob} L={L} cleanupPassword={slave.ssh.osPassword} />
        </section>
      )}

      {step !== STEP_PROGRESS && (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)} disabled={step === STEP_TARGET}>{W.prev}</Button>
          {step < STEP_SUMMARY && <Button onClick={() => setStep((s) => s + 1)} disabled={!stepOk[step]}>{W.next}</Button>}
          {step === STEP_SUMMARY && <Button onClick={start} disabled={starting || live}>{L.run}</Button>}
        </div>
      )}
    </div>
  );
}
