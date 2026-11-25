import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { hostApi } from '../../hostApi';
import { monitoringApi } from '../../../server/monitoringApi';
import { extractHaHeartbeatNodes, getHaDbServerModes } from '../../haPeerUtils';
import { Input } from '../../../../components/ds/forms/Input';
import { Checkbox } from '../../../../components/ds/forms/Checkbox';
import { Button } from '../../../../components/ds/foundation/Button';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Steps } from '../../../../components/ds/layout/Steps';
import { useCM } from '../../../../constants/useCM';
import { useLatestRef } from '../../../../infrastructure/hooks/useLatestRef';
import SshTargetCard from './SshTargetCard';
import HaJobProgress from './HaJobProgress';
import { errorText, isJobLive, isSshConfirmed, newSshNode } from './haPocShared';
import { buildAddSlaveRequest, buildConvertMasterRequest, summarizeRequests } from './addSlaveRequest';

// POC (HA slave add), opened on a host: the HA master's (every database in
// its ha_db_list goes to the new slave) or a single, non-HA server's (the
// user picks the databases to put in HA). This host's CMS builds the new
// slave on another server over ssh. A wizard: target, new slave, replicas,
// options, summary, progress. A single server is first turned into a
// one-node HA master (ha_convert_master, which restarts the databases
// picked); when that succeeds the slave add (ha_make_slave) starts on its own. Each step's checks must pass before
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
const NONE = [];

export default function HaAddSlaveWizard({ hostUid }) {
  const CM = useCM();
  const L = CM.haSlavePoc;
  const W = CM.haAddSlave;
  const host = useSelector((state) => (state.host.hosts ?? []).find((h) => h.uid === hostUid));
  // ha_db_list from cubrid_ha.conf (undefined until this host's start info is read).
  const haDbNames = useSelector((state) => state.database.haDbNamesByHost?.[hostUid]);
  const databases = useSelector((state) => state.database.databasesByHost?.[hostUid] ?? NONE);
  const activeDbs = useSelector((state) => state.database.activeDatabasesByHost?.[hostUid] ?? NONE);
  const haKnown = haDbNames !== undefined;
  const isHaDb = haKnown && haDbNames.length > 0;

  const [step, setStep] = useState(STEP_TARGET);
  // This host's HA role, the replicas in its node list and each HA database's state (heartbeat list).
  const [ha, setHa] = useState({ done: false, role: null, replicas: [], modes: {}, error: null });
  // Single server: the databases to put in HA, and the restart agreed for exactly those.
  const [picked, setPicked] = useState([]);
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
    monitoringApi.getHaHeartbeatList(hostUid)
      .then((res) => {
        if (cancelled) return;
        const nodes = extractHaHeartbeatNodes(res);
        const replicaNames = nodes
          .filter((node) => (node.state || '').trim().toLowerCase() === 'replica')
          .map((node) => node.hostname || node.ip)
          .filter(Boolean);
        setHa({
          done: true,
          role: (res?.currentnodestate || '').trim().toLowerCase(),
          replicas: replicaNames,
          modes: Object.fromEntries(getHaDbServerModes(res)),
          error: null,
        });
        // Every replica in the master's list must be given; prefilled and fixed.
        setReplicas(replicaNames.map((name) => ({ ...newSshNode(name), locked: true })));
      })
      .catch((err) => { if (!cancelled) setHa({ done: true, role: null, replicas: [], modes: {}, error: errorText(err) }); });
    return () => { cancelled = true; };
  }, [hostUid, isHaDb]);

  const patchReplica = (id) => (patch) => setReplicas((prev) => prev.map((node) => (node.id === id ? { ...node, ...patch } : node)));
  const setOption = (key) => (e) => setOptions((prev) => ({ ...prev, [key]: e.target.value }));

  const togglePick = (name) => (e) => {
    const on = e.target.checked;
    setPicked((prev) => (on ? [...prev, name] : prev.filter((n) => n !== name)));
    // The agreement was for the list shown; a new list needs it again.
    setSwitchConfirmed(false);
  };
  // The databases the job covers: all of ha_db_list, or the ones picked.
  const dbNames = isHaDb ? haDbNames : picked;
  const dbname = dbNames[0];

  // What each step needs before Next.
  const targetOk = isHaDb
    ? ha.done && !ha.error && ha.role === 'master'
    : haKnown && picked.length > 0 && switchConfirmed;
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
  // Until the host-level spec: the requests still name one database (the first).
  const request = { dbname, dbNames, slave, replicas, options };

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
          <span>{W.host}: <b>{host?.alias || host?.address}</b> ({host?.address}:{host?.port})</span>
          {!haKnown && <span className="text-slate-500">{W.readingHa}</span>}
          {haKnown && <span>{W.mode}: {isHaDb ? W.modeHa : W.modeSingle}</span>}
          {isHaDb && (
            !ha.done ? <span className="text-slate-500">{W.readingHa}</span>
              : ha.error ? <span className="text-rose-500">{ha.error}</span>
                : (
                  <>
                    <span>{W.haRole}: {ha.role || '-'}</span>
                    {ha.role !== 'master' && <span className="text-rose-500">{W.notMaster}</span>}
                    <span>{L.replicaSection}: {ha.replicas.length ? ha.replicas.join(', ') : W.none}</span>
                    <Typography variant="h4">{W.haDatabases}</Typography>
                    <span className="text-slate-500">{W.haDbNote}</span>
                    <DbTable
                      W={W}
                      rows={haDbNames.map((name) => ({ name, running: activeDbs.includes(name), haState: ha.modes[name] }))}
                      haState
                      empty={W.noHaDatabases}
                    />
                  </>
                )
          )}
          {haKnown && !isHaDb && (
            <>
              <Typography variant="h4">{W.singleDatabases}</Typography>
              <span className="text-slate-500">{W.singlePick}</span>
              <DbTable
                W={W}
                rows={databases.map(({ dbname: name }) => ({ name, running: activeDbs.includes(name) }))}
                picked={picked}
                onPick={togglePick}
                empty={W.noDatabases}
              />
              {picked.length > 0 && (
                <div className="flex flex-col gap-2 p-3 rounded border border-amber-300 bg-amber-50 dark:bg-amber-500/10">
                  <span className="text-amber-700 dark:text-amber-300">{W.singleWarning}</span>
                  <span>{W.restartList} <b>{picked.join(', ')}</b></span>
                  <Checkbox label={W.singleConfirm} checked={switchConfirmed} onChange={(e) => setSwitchConfirmed(e.target.checked)} />
                </div>
              )}
            </>
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
          {!isHaDb && (
            <span className="text-13 text-amber-700 dark:text-amber-300">{W.singleWarning} {W.restartList} {picked.join(', ')}</span>
          )}
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

/**
 * The databases of step one. HA: name, running, HA state. Single: a checkbox
 * per database (its label is the name; only a running one can be picked), running.
 */
function DbTable({ W, rows, haState = false, picked, onPick, empty }) {
  if (rows.length === 0) return <span className="text-slate-500">{empty}</span>;
  const cell = 'py-1 pr-6';
  return (
    <table className="w-fit border-collapse">
      <thead>
        <tr className="text-left text-slate-500">
          <th className={`${cell} font-medium`}>{W.colDatabase}</th>
          <th className={`${cell} font-medium`}>{W.colRunning}</th>
          {haState && <th className={`${cell} font-medium`}>{W.colHaState}</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name} className="border-t border-slate-100 dark:border-white/5" data-testid={`ha-target-db-${row.name}`}>
            <td className={`${cell} font-mono`}>
              {onPick
                ? <Checkbox label={row.name} checked={picked.includes(row.name)} onChange={onPick(row.name)} disabled={!row.running} />
                : row.name}
            </td>
            <td className={`${cell} ${row.running ? 'text-emerald-600' : 'text-slate-400'}`}>{row.running ? W.running : W.stopped}</td>
            {haState && <td className={cell}>{row.haState || '-'}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
