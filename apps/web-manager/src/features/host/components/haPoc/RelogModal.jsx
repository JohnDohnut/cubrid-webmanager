import React, { useState } from 'react';
import { Modal } from '../../../../components/ds/layout/Modal';
import { Input } from '../../../../components/ds/forms/Input';
import { Button } from '../../../../components/ds/foundation/Button';

/**
 * POC (HA node add): before an undo, the OS passwords the wizard does not
 * hold: the nodes whose connection dropped during the job, or, once the
 * browser was closed, every node with undo left. Nothing is kept or filled in from before,
 * and the inputs go when the window closes (it is rendered only while open).
 * `onSubmit({ host: password })`.
 */
export default function RelogModal({ hosts, lost = [], note, L, onCancel, onSubmit }) {
  const [passwords, setPasswords] = useState({});
  const ready = hosts.every((host) => passwords[host]);
  const submit = () => { if (ready) onSubmit(passwords); };
  return (
    <Modal
      isOpen
      title={L.relogTitle}
      icon="lock"
      onClose={onCancel}
      onSubmit={submit}
      submitDisabled={!ready}
      testId="ha-relog"
      footer={(
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>{L.relogCancel}</Button>
          <Button onClick={submit} disabled={!ready}>{L.rollback}</Button>
        </div>
      )}
    >
      <div className="flex flex-col gap-3 text-13">
        <span>{note ?? L.relogNote}</span>
        {hosts.map((host) => (
          <Input
            key={host}
            label={lost.includes(host) ? L.relogPasswordLost(host) : L.relogPassword(host)}
            type="password"
            autoComplete="new-password"
            value={passwords[host] ?? ''}
            onChange={(e) => setPasswords((prev) => ({ ...prev, [host]: e.target.value }))}
          />
        ))}
      </div>
    </Modal>
  );
}
