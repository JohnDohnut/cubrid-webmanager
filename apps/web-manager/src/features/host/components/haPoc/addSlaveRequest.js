// POC (HA slave add): the wizard's state as the requests to the master's
// CMS. Passwords only go in here, when the job starts.

const trimmed = (value) => (typeof value === 'string' ? value.trim() : value);

const sshNodeBody = (node) => ({
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

/** ha_make_slave, for every database in the master's ha_db_list: the new slave (its node name is also the address), the replicas, the options. */
export function buildAddSlaveRequest({ slave, replicas, options }) {
  const body = {
    slave: sshNodeBody(slave),
    startHa: options.startHa !== false,
  };
  for (const key of ['replLogHome', 'masterBackupPath', 'slaveBackupPath']) {
    const value = trimmed(options[key]);
    if (value) body[key] = value;
  }
  if (replicas.length > 0) body.replicas = replicas.map(sshNodeBody);
  return body;
}

/** What the summary step shows: the requests with the passwords left out. */
export function summarizeRequests(state, { convert }) {
  const hide = (node) => ({ ...node, osPassword: node.osPassword ? '••••' : '' });
  const add = buildAddSlaveRequest(state);
  return {
    ...(convert ? { convertMaster: buildConvertMasterRequest(state) } : {}),
    addSlave: { ...add, slave: hide(add.slave), ...(add.replicas ? { replicas: add.replicas.map(hide) } : {}) },
  };
}
