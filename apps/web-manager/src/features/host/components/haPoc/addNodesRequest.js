// POC (HA node add): the wizard's state as the requests to this host's
// CMS. Passwords only go in here, when the job starts.
// The shape follows the CMS design draft (ha_add_nodes: a script and the
// API that runs it); the NCA server side waits for its review.

const sshNodeBody = (node) => ({
  ...(node.role ? { role: node.role } : {}),
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

/**
 * ha_add_nodes (action plan or run): the new nodes with their roles, the
 * existing nodes (CMS takes their roles from this host's settings), the
 * options; for a single server also the databases to put in HA. The
 * restart confirmations go only with run: the ones the plan asked for
 * (confirm_required) that the user agreed to (`confirmKeys`).
 */
export function buildAddNodesRequest({ newNodes, peers, options, single, dbNames }, action = 'plan', confirmKeys = []) {
  const body = {
    action,
    newNodes: newNodes.map(sshNodeBody),
    existingNodes: peers.map((node) => sshNodeBody({ ...node, role: undefined })),
    startHa: options.startHa !== false,
  };
  if (action === 'run') {
    if (confirmKeys.includes('confirm_master_restart')) body.confirmMasterRestart = true;
    if (confirmKeys.includes('confirm_other_db_restart')) body.confirmOtherDbRestart = true;
  }
  if (single) {
    body.dbNames = dbNames;
    body.rollbackConvert = Boolean(options.rollbackConvert);
  }
  // No folders: CMS and the script take each node's $CUBRID_DATABASES.
  return body;
}

/** What the summary step shows: the request with the passwords left out. */
export function summarizeRequest(state) {
  const hide = (node) => ({ ...node, osPassword: node.osPassword ? '••••' : '' });
  const add = buildAddNodesRequest(state);
  return { ...add, newNodes: add.newNodes.map(hide), existingNodes: add.existingNodes.map(hide) };
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
