import React from 'react';

// POC (HA node add): why an ssh connection to a node failed, as CMS reports
// it (ha_check_ssh's result, or a plan's failed node check): the node, the
// cause, what to do, and CMS's own text. A code not known here shows as it
// is, with CMS's own hint if it gives one. The codes follow CMS's list.

/**
 * `node`: the node's name; `code`: CMS's code; `message`: its text; `hint`:
 * its "what to do" line if it sends one. `causes`: { code: { cause, todo } }.
 */
export default function SshProblem({ node, code, message, hint, causes, labels, testId }) {
  const known = causes[code];
  return (
    <div className="flex flex-col gap-0.5 text-13" data-testid={testId}>
      <span className="text-rose-600 dark:text-rose-300">
        {node ? <b className="font-mono">{node}</b> : null}{node ? ' · ' : ''}{labels.cause}: {known?.cause ?? code}
      </span>
      {(hint || known?.todo) && <span>{labels.todo}: {hint || known.todo}</span>}
      {message && <span className="text-slate-500 break-all">{labels.detail}: {message}</span>}
    </div>
  );
}
