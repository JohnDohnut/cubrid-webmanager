import React from 'react';
import { hostApi } from '../../hostApi';
import { Input } from '../../../../components/ds/forms/Input';
import { Checkbox } from '../../../../components/ds/forms/Checkbox';
import { Button } from '../../../../components/ds/foundation/Button';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { STATE_STYLE, errorText, sshTarget } from './haPocShared';
import SshProblem from './SshProblem';

// ha_check_ssh results that are not a failure: done, or the key to confirm (the first round).
const NOT_A_PROBLEM = new Set(['ok', 'hostkey_unknown']);

const SSH_FIELDS = [
  { key: 'host' },
  { key: 'sshPort', type: 'number' },
  { key: 'osUser', autoComplete: 'off' },
  { key: 'osPassword', type: 'password', autoComplete: 'new-password' },
];

/**
 * The inputs and the two-round connection check of one node reached over
 * ssh: the first round sends no password and returns the host key; the user
 * confirms the key, and the second round logs in with it. The password stays
 * in the caller's state and goes only into that second request.
 *
 * `labels`: { host, sshPort, osUser, osPassword, acceptFingerprint }; `L`: the shared POC labels.
 * `hostLocked`: the host comes from the HA settings and cannot be changed here.
 * `causes`/`sshLabels`: a failed check's cause and what to do, by CMS's code.
 */
export default function SshTargetCard({ hostUid, title, node, onChange, onRemove, disabled, hostLocked = false, L, labels, causes = {}, sshLabels }) {
  const setField = (key) => (e) => onChange({
    ssh: { ...node.ssh, [key]: e.target.value },
    // Another node or account: the earlier check and the accepted key no longer apply.
    check: null,
    accepted: false,
  });

  const callCheck = async (body) => {
    onChange({ checking: true });
    try {
      const res = await hostApi.haAddNodesCheck(hostUid, body);
      onChange({ checking: false, check: res ?? {} });
      return res;
    } catch (err) {
      onChange({ checking: false, check: { error: errorText(err) } });
      return null;
    }
  };

  const runCheck = () => {
    onChange({ accepted: false });
    callCheck(sshTarget(node.ssh));
  };

  const acceptKey = async (e) => {
    const on = e.target.checked;
    onChange({ accepted: on });
    if (!on || !node.check?.hostkey_sha256) return;
    const res = await callCheck({ ...sshTarget(node.ssh), osPassword: node.ssh.osPassword, hostKeyFingerprint: node.check.hostkey_sha256 });
    if (res?.result !== 'ok') onChange({ accepted: false });
  };

  const { check } = node;
  const filled = node.ssh.host.trim() && node.ssh.osUser.trim();
  return (
    <div className="flex flex-col gap-3">
      {(title || onRemove) && (
        <div className="flex items-center gap-3">
          {title && <Typography variant="h4">{title}</Typography>}
          {onRemove && <Button size="sm" variant="ghost" onClick={onRemove} disabled={disabled}>{L.removeReplica}</Button>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {SSH_FIELDS.map(({ key, type, autoComplete }) => (
          <Input
            key={key}
            label={labels[key]}
            type={type}
            value={node.ssh[key]}
            onChange={setField(key)}
            autoComplete={autoComplete}
            disabled={disabled || (key === 'host' && hostLocked)}
          />
        ))}
      </div>
      <div>
        <Button onClick={runCheck} disabled={!filled || node.checking || disabled}>{node.checking ? L.checking : L.check}</Button>
      </div>
      {check && (
        <div className="flex flex-col gap-1 text-13">
          {check.error ? (
            <span className="text-rose-500">{check.error}</span>
          ) : (
            <>
              <span>
                {L.result}: <span className={STATE_STYLE[check.result] ?? 'text-rose-500'}>{check.result}</span>
                {check.message && (NOT_A_PROBLEM.has(check.result) || !sshLabels) ? ` - ${check.message}` : ''}
              </span>
              {!NOT_A_PROBLEM.has(check.result) && sshLabels && (
                <SshProblem
                  node={node.ssh.host.trim()}
                  code={check.result}
                  message={check.message}
                  hint={check.action ?? check.hint}
                  causes={causes}
                  labels={sshLabels}
                  testId="ha-ssh-problem"
                />
              )}
              {check.hostkey_sha256 && (
                <span>{L.fingerprint}: <code className="font-mono">{check.hostkey_type} {check.hostkey_sha256}</code></span>
              )}
              {check.remote_hostname && <span>{L.remoteHostname}: {check.remote_hostname}</span>}
              {(check.remote_version || check.local_version) && (
                <span>{L.versions}: {check.remote_version ?? '-'} / {check.local_version ?? '-'}</span>
              )}
              {check.remote_cubrid_databases && <span>{L.remoteDatabases}: {check.remote_cubrid_databases}</span>}
              {check.hostkey_sha256 && (
                <Checkbox
                  label={labels.acceptFingerprint}
                  checked={node.accepted}
                  onChange={acceptKey}
                  disabled={disabled || node.checking || !node.ssh.osPassword}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
