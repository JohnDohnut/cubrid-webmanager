import React, { useState } from 'react';
import { hostApi } from '../../hostApi';
import { Input } from '../../../../components/ds/forms/Input';
import { Button } from '../../../../components/ds/foundation/Button';
import { errorText, isSshConfirmed, sshTarget } from './haPocShared';

/**
 * For many nodes at once (an HA group can have ten): one OS account put into
 * every node, and the first connection check (no password; it returns the
 * host key) run on every node in turn. Each key is still confirmed on its
 * own node's card. `nodes`/`setNodes`: the wizard's list of ssh nodes.
 */
export default function BulkSshTools({ hostUid, nodes, setNodes, W, L, testId }) {
  const [osUser, setOsUser] = useState('');
  const [osPassword, setOsPassword] = useState('');
  const [checking, setChecking] = useState(false);

  const patch = (id, change) => setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, ...change } : node)));

  const fillAll = () => setNodes((prev) => prev.map((node) => ({
    ...node,
    ssh: { ...node.ssh, osUser, osPassword },
    // Another account: the earlier check and the accepted key no longer apply.
    check: null,
    accepted: false,
  })));

  // One at a time: the node's CMS runs its requests in turn anyway.
  const checkAll = async () => {
    setChecking(true);
    for (const node of nodes) {
      if (!node.ssh.host.trim() || !node.ssh.osUser.trim() || isSshConfirmed(node)) continue;
      patch(node.id, { checking: true, accepted: false });
      try {
        const res = await hostApi.haAddSlaveCheck(hostUid, sshTarget(node.ssh));
        patch(node.id, { checking: false, check: res ?? {} });
      } catch (err) {
        patch(node.id, { checking: false, check: { error: errorText(err) } });
      }
    }
    setChecking(false);
  };

  const confirmed = nodes.filter(isSshConfirmed).length;
  return (
    <div className="flex flex-col gap-2 p-3 rounded bg-slate-50 dark:bg-white/5" data-testid={testId}>
      <span className="text-13 text-slate-500">{W.bulkHint}</span>
      <div className="flex items-end gap-3 flex-wrap">
        <Input label={L.osUser} value={osUser} onChange={(e) => setOsUser(e.target.value)} autoComplete="off" />
        <Input label={L.osPassword} type="password" value={osPassword} onChange={(e) => setOsPassword(e.target.value)} autoComplete="new-password" />
        <Button variant="secondary" onClick={fillAll} disabled={!osUser.trim() || checking}>{W.bulkFill}</Button>
        <Button variant="secondary" onClick={checkAll} disabled={checking || nodes.length === 0}>{checking ? L.checking : W.bulkCheck}</Button>
      </div>
      <span className="text-13">{W.confirmedCount(confirmed, nodes.length)}</span>
    </div>
  );
}
