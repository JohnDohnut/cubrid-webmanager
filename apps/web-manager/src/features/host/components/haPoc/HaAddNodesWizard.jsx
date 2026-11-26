import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { hostApi } from '../../hostApi';
import { dbKey } from '../../../database/dbKey';
import { monitoringApi } from '../../../server/monitoringApi';
import { extractHaHeartbeatNodes, getHaDbServerModes } from '../../haPeerUtils';
import { Checkbox } from '../../../../components/ds/forms/Checkbox';
import { Button } from '../../../../components/ds/foundation/Button';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Steps } from '../../../../components/ds/layout/Steps';
import { useCM } from '../../../../constants/useCM';
import SshTargetCard from './SshTargetCard';
import { STATE_STYLE, errorText, isJobLive, isSshConfirmed, newSshNode, pathProblems } from './haPocShared';
import BulkSshTools from './BulkSshTools';
import PlanView from './PlanView';
import HaJobProgress from './HaJobProgress';
import { useHaJobPolling } from './useHaJobPolling';
import { buildAddNodesRequest, convertPlan, newNodesProblem, summarizeRequest } from './addNodesRequest';

// POC (HA node add), opened on a host: adds new slaves and replicas, any
// number of each, to its HA group in one go. The host is the group's master,
// one of its slaves, or a single (non-HA) server that first becomes a
// one-node master with the databases the user picks (which restarts every
// running database). Every database in ha_db_list goes to the new nodes, and
// every existing node (slaves, replicas, the master when run on a slave)
// gets the new ones registered. A wizard: target, nodes to add, existing
// nodes, options, summary, progress. Each step's checks must pass before
// Next; passwords stay in this state and go only into the requests.
// CMS (ha_add_nodes: a script and the API that runs it) first makes a plan
// (every node checked, the roles, what changes, the databases that restart,
// the steps), changing nothing; the summary shows it with the confirmations
// it asks for, and only then the run starts.

const STEP_TARGET = 0;
const STEP_NEW_NODES = 1;
const STEP_EXISTING = 2;
const STEP_OPTIONS = 3;
const STEP_SUMMARY = 4;
const STEP_PROGRESS = 5;
const newJob = (res) => ({ uuid: res?.uuid, job_status: res?.job_status ?? 'running', steps: [], log: '', offset: 0 });
const NONE = [];
const ROLES = ['slave', 'replica'];

/** A node's role in the group from its heartbeat state; a node down shows as unknown, so it counts as a slave. */
const roleOf = (node) => {
  const state = (node.state || '').trim().toLowerCase();
  return state === 'replica' || state === 'master' ? state : 'slave';
};

export default function HaAddNodesWizard({ hostUid }) {
  const CM = useCM();
  const L = CM.haSlavePoc;
  const W = CM.haAddSlave;
  const host = useSelector((state) => (state.host.hosts ?? []).find((h) => h.uid === hostUid));
  // ha_db_list from cubrid_ha.conf (undefined until this host's start info is read).
  const haDbNames = useSelector((state) => state.database.haDbNamesByHost?.[hostUid]);
  const databases = useSelector((state) => state.database.databasesByHost?.[hostUid] ?? NONE);
  const activeDbs = useSelector((state) => state.database.activeDatabasesByHost?.[hostUid] ?? NONE);
  const loggedIn = useSelector((state) => state.database.loggedInDatabases ?? NONE);
  const haKnown = haDbNames !== undefined;
  const isHaDb = haKnown && haDbNames.length > 0;

  const [step, setStep] = useState(STEP_TARGET);
  // This node's name and role, the group's other nodes with theirs, and each HA database's state (heartbeat list).
  const [ha, setHa] = useState({ done: false, self: '', role: null, nodes: [], modes: {}, error: null });
  // Single server: the databases to put in HA, and the restarts agreed for exactly that pick.
  const [picked, setPicked] = useState([]);
  const [switchConfirmed, setSwitchConfirmed] = useState(false);
  const [otherConfirmed, setOtherConfirmed] = useState(false);
  // The servers to add: { ...ssh node, role: 'slave' | 'replica' }.
  const [newNodes, setNewNodes] = useState(() => [{ ...newSshNode(), role: 'slave' }]);
  // The existing nodes the new ones are registered on: { ...ssh node, role: 'master' | 'slave' | 'replica' }.
  const [peers, setPeers] = useState([]);
  // Only what changes the behavior; folders and HA ports take CMS's defaults (each node's $CUBRID_DATABASES).
  const [options, setOptions] = useState({ startHa: true, rollbackConvert: false });
  // The plan job, then the run's; and the confirmations given on the plan.
  const [planJob, setPlanJob] = useState(null);
  const [planAgreed, setPlanAgreed] = useState([]);
  const [runJob, setRunJob] = useState(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);
  useHaJobPolling(hostUid, planJob, setPlanJob);

  useEffect(() => {
    if (!isHaDb) return undefined;
    let cancelled = false;
    monitoringApi.getHaHeartbeatList(hostUid)
      .then((res) => {
        if (cancelled) return;
        const self = (res?.currentnode || '').trim();
        const nameOf = (node) => (node.hostname || node.ip || '').trim();
        // ha_node_list and ha_replica_list without this node: the existing nodes, all of which must be given.
        const others = extractHaHeartbeatNodes(res)
          .filter((node) => nameOf(node) && nameOf(node) !== self)
          .map((node) => ({ name: nameOf(node), role: roleOf(node) }));
        setHa({
          done: true,
          self,
          role: (res?.currentnodestate || '').trim().toLowerCase(),
          nodes: others,
          modes: Object.fromEntries(getHaDbServerModes(res)),
          error: null,
        });
        setPeers(others.map(({ name, role }) => ({ ...newSshNode(name), role, locked: true })));
      })
      .catch((err) => { if (!cancelled) setHa({ done: true, self: '', role: null, nodes: [], modes: {}, error: errorText(err) }); });
    return () => { cancelled = true; };
  }, [hostUid, isHaDb]);

  const patchIn = (setter, id) => (patch) => setter((prev) => prev.map((node) => (node.id === id ? { ...node, ...patch } : node)));

  const allNames = databases.map((db) => db.dbname);
  // In databases.txt order, as the table shows them.
  const promo = convertPlan({ picked: allNames.filter((name) => picked.includes(name)), running: allNames.filter((name) => activeDbs.includes(name)), all: allNames });
  const hasOthers = promo.otherRunningDatabases.length > 0;
  const togglePick = (name) => (e) => {
    const on = e.target.checked;
    setPicked((prev) => (on ? [...prev, name] : prev.filter((n) => n !== name)));
    // The agreement was for the lists shown; new lists need it again.
    setSwitchConfirmed(false);
    setOtherConfirmed(false);
  };

  // Where it runs: a single server or the master. A slave or a replica host (cases 5, 6) waits until
  // CMS supports it (its plan refuses them for now); the rest of the wizard already handles them.
  const runsOnHa = isHaDb && ha.done && !ha.error && ha.role === 'master';
  const targetOk = isHaDb
    ? runsOnHa
    : haKnown && picked.length > 0 && switchConfirmed && (!hasOthers || otherConfirmed);
  const masterName = ha.role === 'master' ? ha.self : ha.nodes.find((node) => node.role === 'master')?.name;

  // Each new node's name is also its address: it must be that server's uname -n, once, and new to the group.
  const nameMismatch = (node) => node.check?.result === 'ok' && node.check.remote_hostname && node.check.remote_hostname !== node.ssh.host.trim();
  const problem = newNodesProblem(newNodes, [ha.self, ...ha.nodes.map((node) => node.name)].filter(Boolean));
  const stepOk = {
    [STEP_TARGET]: targetOk,
    [STEP_NEW_NODES]: !problem && newNodes.every((node) => isSshConfirmed(node) && !nameMismatch(node)),
    [STEP_EXISTING]: peers.every(isSshConfirmed),
    [STEP_OPTIONS]: true,
  };
  // The databases the job covers, also the ones to look for tables without a primary key in.
  const targetDbs = isHaDb ? haDbNames : promo.haDatabases;
  const notLoggedIn = targetDbs.filter((name) => !loggedIn.includes(dbKey(hostUid, name)));
  const request = { single: !isHaDb, dbNames: promo.haDatabases, checkDbNames: targetDbs, newNodes, peers, options };

  // The restarts agreed in the first step count for the plan's confirmations too.
  const firstAgreed = isHaDb ? [] : [
    ...(switchConfirmed ? ['confirm_master_restart'] : []),
    ...(otherConfirmed ? ['confirm_other_db_restart'] : []),
  ];
  const agreed = [...firstAgreed, ...planAgreed];
  const planReady = planJob?.job_status === 'success' && planJob?.phase !== 'rollback' && planJob?.plan;
  const required = planReady && Array.isArray(planJob.plan.confirm_required) ? planJob.plan.confirm_required : [];
  const canRun = Boolean(planReady) && required.every((key) => agreed.includes(key)) && !runJob;
  const planFailures = planJob && !isJobLive(planJob) && !planReady
    ? (planJob.steps ?? []).filter((s) => s.state === 'failed')
    : [];

  const startJob = async (action) => {
    setStarting(true);
    setStartError(null);
    try {
      const res = await hostApi.haAddNodesStart(hostUid, buildAddNodesRequest(request, action, agreed));
      if (action === 'plan') {
        setPlanAgreed([]);
        setPlanJob(newJob(res));
      } else {
        setRunJob(newJob(res));
        setStep(STEP_PROGRESS);
      }
    } catch (err) {
      setStartError(errorText(err));
    } finally {
      setStarting(false);
    }
  };
  const back = () => {
    // Inputs may change on the way back: the plan no longer applies.
    if (step === STEP_SUMMARY) {
      setPlanJob(null);
      setPlanAgreed([]);
      setStartError(null);
    }
    setStep((s) => s - 1);
  };

  const roleName = { master: W.roleMaster, slave: W.roleSlave, replica: W.roleReplica };
  const nodeList = (nodes) => (nodes.length ? nodes.map((node) => `${node.ssh.host.trim()} (${roleName[node.role]})`).join(', ') : W.none);
  const stepNames = [W.stepTarget, W.stepNewNodes, W.stepReplicas, W.stepOptions, W.stepSummary, W.stepProgress];
  const sshLabels = (hostLabel) => ({ host: hostLabel, sshPort: L.sshPort, osUser: L.osUser, osPassword: L.osPassword, acceptFingerprint: W.acceptNodeFingerprint });

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
          {haKnown && !isHaDb && <span>{W.mode}: {W.modeSingle}</span>}
          {isHaDb && (
            !ha.done ? <span className="text-slate-500">{W.readingHa}</span>
              : ha.error ? <span className="text-rose-500">{ha.error}</span>
                : (
                  <>
                    <span>{W.mode}: {W.modeHa} · {W.haRole}: {ha.role || '-'}</span>
                    {!runsOnHa && (
                      <span className="text-rose-500">
                        {ha.role === 'replica' ? W.replicaHostNotYet : ha.role === 'slave' ? W.slaveHostNotYet(masterName || '-') : W.roleNotAllowed}
                      </span>
                    )}
                    <Typography variant="h4">{W.haNodes}</Typography>
                    <NodeTable
                      W={W}
                      rows={[{ name: ha.self, role: ha.role, self: true }, ...ha.nodes]}
                      roleName={roleName}
                    />
                    <Typography variant="h4">{W.haDatabases}</Typography>
                    <span className="text-slate-500">{W.haDbNote}</span>
                    <DbTable
                      W={W}
                      rows={haDbNames.map((name) => ({ name, running: activeDbs.includes(name), haState: ha.modes[name] }))}
                      haState
                      empty={W.noHaDatabases}
                    />
                    {notLoggedIn.length > 0 && <span className="text-slate-500" data-testid="ha-pk-login-hint">{W.pkLoginHint(notLoggedIn.join(', '))}</span>}
                  </>
                )
          )}
          {haKnown && !isHaDb && (
            <>
              <Typography variant="h4">{W.singleDatabases}</Typography>
              <span className="text-slate-500">{W.singlePick}</span>
              <DbTable
                W={W}
                rows={allNames.map((name) => ({ name, running: activeDbs.includes(name) }))}
                picked={picked}
                onPick={togglePick}
                empty={W.noDatabases}
              />
              {picked.length > 0 && (
                <div className="flex flex-col gap-2 p-3 rounded border border-amber-300 bg-amber-50 dark:bg-amber-500/10" data-testid="ha-convert-plan">
                  <Typography variant="h4">{W.promoteTitle}</Typography>
                  <span className="text-amber-700 dark:text-amber-300">{W.singleWarning}</span>
                  <span>{W.haList} <b>{promo.haDatabases.join(', ')}</b></span>
                  <span>{W.restartList} <b>{listText(promo.restartDatabases, W.none)}</b></span>
                  {hasOthers && <span>{W.otherRestartList} <b>{promo.otherRunningDatabases.join(', ')}</b></span>}
                  <span>{W.singleStayList} {listText(promo.singleDatabases, W.none)}</span>
                  <Checkbox label={W.singleConfirm} checked={switchConfirmed} onChange={(e) => setSwitchConfirmed(e.target.checked)} />
                  {hasOthers && <Checkbox label={W.otherConfirm} checked={otherConfirmed} onChange={(e) => setOtherConfirmed(e.target.checked)} />}
                </div>
              )}
              {notLoggedIn.length > 0 && <span className="text-slate-500" data-testid="ha-pk-login-hint">{W.pkLoginHint(notLoggedIn.join(', '))}</span>}
            </>
          )}
        </section>
      )}

      {step === STEP_NEW_NODES && (
        <section className="flex flex-col gap-4">
          <Typography variant="h3">{W.stepNewNodes}</Typography>
          <span className="text-13 text-slate-500">{W.newNodesHint}</span>
          {newNodes.length > 1 && <BulkSshTools hostUid={hostUid} nodes={newNodes} setNodes={setNewNodes} W={W} L={L} testId="ha-bulk-new" />}
          {newNodes.map((node, index) => (
            <div key={node.id} className="flex flex-col gap-2 p-3 rounded border border-slate-200 dark:border-white/10" data-testid={`ha-new-node-${index + 1}`}>
              <div className="flex items-center gap-2 text-13">
                <span>{W.role}:</span>
                {ROLES.map((role) => (
                  <Button
                    key={role}
                    size="sm"
                    variant={node.role === role ? 'primary' : 'secondary'}
                    onClick={() => patchIn(setNewNodes, node.id)({ role })}
                  >
                    {roleName[role]}
                  </Button>
                ))}
              </div>
              <SshTargetCard
                hostUid={hostUid}
                title={W.newNodeTitle(index + 1)}
                node={node}
                onChange={patchIn(setNewNodes, node.id)}
                onRemove={newNodes.length > 1 ? () => setNewNodes((prev) => prev.filter((n) => n.id !== node.id)) : undefined}
                L={L}
                labels={sshLabels(W.newNodeHost)}
              />
              {nameMismatch(node) && <span className="text-13 text-rose-500">{W.slaveNameMismatch(node.check.remote_hostname)}</span>}
            </div>
          ))}
          {problem === 'duplicate' && <span className="text-13 text-rose-500">{W.problemDuplicate}</span>}
          {problem === 'taken' && <span className="text-13 text-rose-500">{W.problemTaken}</span>}
          <div>
            <Button variant="secondary" onClick={() => setNewNodes((prev) => [...prev, { ...newSshNode(), role: 'slave' }])}>{W.addNewNode}</Button>
          </div>
        </section>
      )}

      {step === STEP_EXISTING && (
        <section className="flex flex-col gap-4">
          <Typography variant="h3">{W.stepReplicas}</Typography>
          <span className="text-13 text-slate-500">{W.peerHint}</span>
          {peers.length === 0 && <span className="text-13 text-slate-500">{W.noPeers}</span>}
          {peers.length > 1 && <BulkSshTools hostUid={hostUid} nodes={peers} setNodes={setPeers} W={W} L={L} testId="ha-bulk-existing" />}
          {peers.map((node) => (
            <SshTargetCard
              key={node.id}
              hostUid={hostUid}
              title={W.peerTitle(roleName[node.role])}
              node={node}
              onChange={patchIn(setPeers, node.id)}
              hostLocked={node.locked}
              L={L}
              labels={sshLabels(W.peerHost)}
            />
          ))}
        </section>
      )}

      {step === STEP_OPTIONS && (
        <section className="flex flex-col gap-3">
          <Typography variant="h3">{W.stepOptions}</Typography>
          <Checkbox label={L.startHa} checked={options.startHa} onChange={(e) => setOptions((prev) => ({ ...prev, startHa: e.target.checked }))} />
          {!isHaDb && (
            <Checkbox label={W.rollbackConvert} checked={options.rollbackConvert} onChange={(e) => setOptions((prev) => ({ ...prev, rollbackConvert: e.target.checked }))} />
          )}
        </section>
      )}

      {step === STEP_SUMMARY && (
        <section className="flex flex-col gap-3">
          <Typography variant="h3">{W.stepSummary}</Typography>
          <span className="text-13">{W.summaryNew(nodeList(newNodes))}</span>
          <span className="text-13">{W.summaryPeers(nodeList(peers))}</span>
          {!isHaDb && (
            <span className="text-13 text-amber-700 dark:text-amber-300">{W.promoteTitle}: {W.singleWarning} {W.restartList} {listText(promo.restartDatabases, W.none)}</span>
          )}
          <details className="text-13">
            <summary className="cursor-pointer text-slate-500">{W.requestPreview}</summary>
            <pre className="font-mono text-12 bg-slate-100 dark:bg-white/5 p-3 rounded overflow-auto">
              {JSON.stringify(summarizeRequest(request), null, 2)}
            </pre>
          </details>
          <span className="text-13 text-slate-500">{W.planHint}</span>
          {planJob && isJobLive(planJob) && (
            <span className="text-13 text-amber-600" data-testid="ha-plan-running">
              {W.planRunning}{planJob.step_no && planJob.step_count ? ` (${L.stepOf(planJob.step_no, planJob.step_count)})` : ''}
            </span>
          )}
          {planJob && !isJobLive(planJob) && !planReady && (
            <div className="flex flex-col gap-1 text-13 p-3 rounded border border-rose-300 bg-rose-50 dark:bg-rose-500/10" data-testid="ha-plan-failed">
              <span className="text-rose-600 dark:text-rose-300">
                {W.planFailed}: {planJob.error || planJob.job_status}
                {/* The failed step's own detail says it per node below; the message only when no step does. */}
                {planFailures.length === 0 && planJob.message ? `: ${planJob.message}` : ''}
              </span>
              {planFailures.map((f) => {
                const problems = pathProblems(f.detail);
                return (
                  <div key={f.no} className="flex flex-col gap-1" data-testid={`ha-plan-failed-${f.node || 'local'}`}>
                    <span><b className="font-mono">{f.node || host?.alias || '-'}</b> · {f.title || f.id}</span>
                    {problems ? (
                      <table className="w-fit border-collapse">
                        <tbody>
                          {problems.map((p) => (
                            <tr key={p.path}>
                              <td className="py-0.5 pr-6 font-mono">{p.path}</td>
                              <td className={`py-0.5 pr-6 ${STATE_STYLE.failed}`}>{p.why}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <span className={`font-mono break-all ${STATE_STYLE.failed}`}>{f.detail || f.state}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {planReady && (
            <PlanView
              plan={planJob.plan}
              W={W}
              L={L}
              agreed={agreed}
              onAgree={(key, on) => setPlanAgreed((prev) => (on ? [...prev, key] : prev.filter((k) => k !== key)))}
            />
          )}
          {startError && <span className="text-13 text-rose-500">{startError}</span>}
        </section>
      )}

      {step === STEP_PROGRESS && runJob && (
        <section className="flex flex-col gap-3">
          <Typography variant="h3">{W.stepProgress}</Typography>
          <HaJobProgress
            hostUid={hostUid}
            job={runJob}
            setJob={setRunJob}
            L={L}
            promoting={!isHaDb}
            cleanupNodes={buildAddNodesRequest(request).newNodes}
          />
        </section>
      )}

      {step !== STEP_PROGRESS && (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={back} disabled={step === STEP_TARGET || starting || isJobLive(planJob)}>{W.prev}</Button>
          {step < STEP_SUMMARY && <Button onClick={() => setStep((s) => s + 1)} disabled={!stepOk[step]}>{W.next}</Button>}
          {step === STEP_SUMMARY && (
            <>
              <Button variant="secondary" onClick={() => startJob('plan')} disabled={starting || isJobLive(planJob)}>
                {planJob ? W.planAgain : W.getPlan}
              </Button>
              <Button onClick={() => startJob('run')} disabled={starting || !canRun}>{L.run}</Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const listText = (names, none) => (Array.isArray(names) && names.length ? names.join(', ') : none);

/** The HA group's nodes in step one: name and role, this host marked. */
function NodeTable({ W, rows, roleName }) {
  const cell = 'py-1 pr-6';
  return (
    <table className="w-fit border-collapse">
      <thead>
        <tr className="text-left text-slate-500">
          <th className={`${cell} font-medium`}>{W.colNode}</th>
          <th className={`${cell} font-medium`}>{W.role}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name} className="border-t border-slate-100 dark:border-white/5" data-testid={`ha-target-node-${row.name}`}>
            <td className={`${cell} font-mono`}>{row.name}{row.self ? ` (${W.thisHost})` : ''}</td>
            <td className={cell}>{roleName[row.role] ?? row.role ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * The databases of step one. HA: name, running, HA state. Single: a checkbox
 * per database (its label is the name; a stopped one can be picked too), running.
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
                ? <Checkbox label={row.name} checked={picked.includes(row.name)} onChange={onPick(row.name)} />
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
