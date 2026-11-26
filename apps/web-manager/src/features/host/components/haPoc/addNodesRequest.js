// POC (HA node add): the wizard's state as the requests to this host's
// CMS. Passwords only go in here, when the job starts.
// The add request's shape waits for the CMS design (script + API); until
// then it is the wizard's own: the new nodes and the existing nodes, each
// with its role.

const trimmed = (value) => (typeof value === 'string' ? value.trim() : value);

const sshNodeBody = (node) => ({
  role: node.role,
  host: node.ssh.host.trim(),
  sshPort: Number(node.ssh.sshPort) || 22,
  osUser: node.ssh.osUser.trim(),
  osPassword: node.ssh.osPassword,
  hostKeyFingerprint: node.check?.hostkey_sha256 ?? '',
});

/**
 * A single server's databases once the picked ones go to HA: every running
 * one restarts; the running ones not picked come back as single databases;
 * the ones not picked stay single.
 */
export function convertPlan({ picked, running, all }) {
  const inHa = new Set(picked);
  return {
    haDatabases: picked,
    restartDatabases: running,
    otherRunningDatabases: running.filter((name) => !inHa.has(name)),
    singleDatabases: all.filter((name) => !inHa.has(name)),
  };
}

/** ha_convert_master, for a single server: the restarts are confirmed in the wizard's first step. */
export function buildConvertMasterRequest({ dbNames, options, confirmOtherDbRestart }) {
  const body = { dbNames, confirmMasterRestart: true };
  if (confirmOtherDbRestart) body.confirmOtherDbRestart = true;
  if (trimmed(options.haGroup)) body.haGroup = trimmed(options.haGroup);
  if (Number(options.haPortId) > 0) body.haPortId = Number(options.haPortId);
  return body;
}

/** The node add, for every database in ha_db_list: the new nodes (slaves and replicas), the existing nodes, the options. */
export function buildAddNodesRequest({ newNodes, peers, options }) {
  const body = {
    newNodes: newNodes.map(sshNodeBody),
    existingNodes: peers.map(sshNodeBody),
    startHa: options.startHa !== false,
  };
  for (const key of ['replLogHome', 'masterBackupPath', 'slaveBackupPath']) {
    const value = trimmed(options[key]);
    if (value) body[key] = value;
  }
  return body;
}

/** What the summary step shows: the requests with the passwords left out. */
export function summarizeRequests(state, { convert }) {
  const hide = (node) => ({ ...node, osPassword: node.osPassword ? '••••' : '' });
  const add = buildAddNodesRequest(state);
  return {
    ...(convert ? { convertMaster: buildConvertMasterRequest(state) } : {}),
    addNodes: { ...add, newNodes: add.newNodes.map(hide), existingNodes: add.existingNodes.map(hide) },
  };
}

/**
 * Why the new nodes cannot go on yet, or null: each needs its own name
 * (its uname -n, also its address), not one the HA group already has.
 */
export function newNodesProblem(newNodes, takenNames) {
  if (newNodes.length === 0) return 'none';
  const names = newNodes.map((node) => node.ssh.host.trim());
  if (names.some((name, i) => name && names.indexOf(name) !== i)) return 'duplicate';
  if (names.some((name) => takenNames.includes(name))) return 'taken';
  return null;
}
