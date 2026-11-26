import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { monitoringApi } from '../../../server/monitoringApi';
import { extractHaHeartbeatNodes, getHaDbServerModes } from '../../haPeerUtils';
import { Input } from '../../../../components/ds/forms/Input';
import { Checkbox } from '../../../../components/ds/forms/Checkbox';
import { Button } from '../../../../components/ds/foundation/Button';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Steps } from '../../../../components/ds/layout/Steps';
import { useCM } from '../../../../constants/useCM';
import SshTargetCard from './SshTargetCard';
import { errorText, isSshConfirmed, newSshNode } from './haPocShared';
import BulkSshTools from './BulkSshTools';
import { convertPlan, newNodesProblem, summarizeRequest } from './addNodesRequest';

// POC (HA node add), opened on a host: adds new slaves and replicas, any
// number of each, to its HA group in one go. The host is the group's master,
// one of its slaves, or a single (non-HA) server that first becomes a
// one-node master with the databases the user picks (which restarts every
// running database). Every database in ha_db_list goes to the new nodes, and
// every existing node (slaves, replicas, the master when run on a slave)
// gets the new ones registered. A wizard: target, nodes to add, existing
// nodes, options, summary, progress. Each step's checks must pass before
// Next; passwords stay in this state and go only into the requests.
// The CMS side (ha_add_nodes: a script and the API that runs it) is in
// design: it first returns a plan (every node checked, the roles, what
// changes, the databases that restart, the step table), shown before run.
// Until its API is wired the summary shows the request, and Start waits.

const STEP_TARGET = 0;
const STEP_NEW_NODES = 1;
const STEP_EXISTING = 2;
const STEP_OPTIONS = 3;
const STEP_SUMMARY = 4;
const OPTION_FIELDS = ['replLogHome', 'backupPath', 'remoteBackupPath'];
// Only for a single server's conversion.
const CONVERT_FIELDS = ['haGroup', 'haPortId'];
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
  const [options, setOptions] = useState({ replLogHome: '', backupPath: '', remoteBackupPath: '', haGroup: '', haPortId: '', startHa: true, rollbackConvert: false });
  const [showAdvanced, setShowAdvanced] = useState(false);

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
  const setOption = (key) => (e) => setOptions((prev) => ({ ...prev, [key]: e.target.value }));

  const allNames = databases.map((db) => db.dbname);
  // In databases.txt order, as the table shows them.
  const plan = convertPlan({ picked: allNames.filter((name) => picked.includes(name)), running: allNames.filter((name) => activeDbs.includes(name)), all: allNames });
  const hasOthers = plan.otherRunningDatabases.length > 0;
  const togglePick = (name) => (e) => {
    const on = e.target.checked;
    setPicked((prev) => (on ? [...prev, name] : prev.filter((n) => n !== name)));
    // The agreement was for the lists shown; new lists need it again.
    setSwitchConfirmed(false);
    setOtherConfirmed(false);
  };

  // Where it runs: a single server, the master or a slave; never a replica.
  const runsOnHa = isHaDb && ha.done && !ha.error && (ha.role === 'master' || ha.role === 'slave');
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
  const request = { single: !isHaDb, dbNames: plan.haDatabases, newNodes, peers, options };

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
                    {!runsOnHa && <span className="text-rose-500">{ha.role === 'replica' ? W.replicaHostNotYet : W.roleNotAllowed}</span>}
                    {ha.role === 'slave' && <span className="text-amber-700 dark:text-amber-300">{W.slaveHostNote(masterName || '-')}</span>}
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
                  <span className="text-amber-700 dark:text-amber-300">{W.singleWarning}</span>
                  <span>{W.haList} <b>{plan.haDatabases.join(', ')}</b></span>
                  <span>{W.restartList} <b>{listText(plan.restartDatabases, W.none)}</b></span>
                  {hasOthers && <span>{W.otherRestartList} <b>{plan.otherRunningDatabases.join(', ')}</b></span>}
                  <span>{W.singleStayList} {listText(plan.singleDatabases, W.none)}</span>
                  <Checkbox label={W.singleConfirm} checked={switchConfirmed} onChange={(e) => setSwitchConfirmed(e.target.checked)} />
                  {hasOthers && <Checkbox label={W.otherConfirm} checked={otherConfirmed} onChange={(e) => setOtherConfirmed(e.target.checked)} />}
                </div>
              )}
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
          <span className="text-13">{W.summaryNew(nodeList(newNodes))}</span>
          <span className="text-13">{W.summaryPeers(nodeList(peers))}</span>
          {!isHaDb && (
            <span className="text-13 text-amber-700 dark:text-amber-300">{W.singleWarning} {W.restartList} {listText(plan.restartDatabases, W.none)}</span>
          )}
          <pre className="font-mono text-12 bg-slate-100 dark:bg-white/5 p-3 rounded overflow-auto">
            {JSON.stringify(summarizeRequest(request), null, 2)}
          </pre>
          <span className="text-13 text-slate-500">{W.apiPending}</span>
        </section>
      )}

      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => setStep((s) => s - 1)} disabled={step === STEP_TARGET}>{W.prev}</Button>
        {step < STEP_SUMMARY && <Button onClick={() => setStep((s) => s + 1)} disabled={!stepOk[step]}>{W.next}</Button>}
        {step === STEP_SUMMARY && <Button disabled>{L.run}</Button>}
      </div>
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
