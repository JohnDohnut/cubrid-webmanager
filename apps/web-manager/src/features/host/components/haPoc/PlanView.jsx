import React from 'react';
import { Checkbox } from '../../../../components/ds/forms/Checkbox';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { isPromoteStep } from './haPocShared';

// POC (HA node add): what CMS's plan (ha_add_nodes, action plan) says it
// will do, shown before run: the nodes and their roles, the switch to HA
// (single server), what changes in which file, the sizes, the replication
// processes added, the warnings, and the step table run will follow.
// Nothing has changed yet when it is shown.

const cell = 'py-1 pr-6 align-top';

const megabytes = (bytes) => {
  const n = Number(bytes);
  return Number.isFinite(n) ? `${(n / 1024 / 1024).toFixed(1)} MB` : '-';
};

/**
 * `plan`: the status response's plan. `agreed`: the confirmation keys the
 * user gave (here or in the first step); `onAgree(key, on)`.
 */
export default function PlanView({ plan, W, agreed, onAgree }) {
  const list = (names) => (Array.isArray(names) && names.length ? names.join(', ') : W.none);
  const roleName = { master: W.roleMaster, slave: W.roleSlave, replica: W.roleReplica };
  const required = Array.isArray(plan.confirm_required) ? plan.confirm_required : [];
  const confirmLabel = { confirm_master_restart: W.singleConfirm, confirm_other_db_restart: W.otherConfirm };
  // A host already HA has no promotion: its steps are not shown at all.
  const steps = (plan.steps ?? []).filter((step) => plan.convert || !isPromoteStep(step));
  return (
    <div className="flex flex-col gap-4 text-13" data-testid="ha-plan">
      <span>{W.planLocal(plan.local?.host ?? '-', plan.local?.state ?? '-')} · {W.planMaster(plan.master_host ?? '-')}</span>
      <span>{W.colDatabase}: {list(plan.db_names)}</span>

      <Typography variant="h4">{W.haNodes}</Typography>
      <table className="w-fit border-collapse">
        <thead>
          <tr className="text-left text-slate-500">
            <th className={`${cell} font-medium`}>{W.colNode}</th>
            <th className={`${cell} font-medium`}>{W.role}</th>
            <th className={`${cell} font-medium`}>{W.colVersion}</th>
          </tr>
        </thead>
        <tbody>
          {(plan.nodes ?? []).map((node) => (
            <tr key={node.host} className="border-t border-slate-100 dark:border-white/5" data-testid={`ha-plan-node-${node.host}`}>
              <td className={`${cell} font-mono`}>{node.host}{node.local ? ` (${W.thisHost})` : ''}</td>
              <td className={cell}>{roleName[node.role] ?? node.role}{node.new ? ` · ${W.planNew}` : ''}</td>
              <td className={cell}>{node.version ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {plan.convert && (
        <div className="flex flex-col gap-1 p-3 rounded border border-amber-300 bg-amber-50 dark:bg-amber-500/10" data-testid="ha-plan-convert">
          <Typography variant="h4">{W.promoteTitle}</Typography>
          <span className="text-amber-700 dark:text-amber-300">{W.singleWarning}</span>
          <span>{W.haList} <b>{list(plan.convert.ha_databases)}</b></span>
          <span>{W.restartList} <b>{list(plan.convert.restart_databases)}</b></span>
          <span>{W.otherRestartList} {list(plan.convert.other_running_databases)}</span>
          <span>{W.singleStayList} {list(plan.convert.single_databases)}</span>
        </div>
      )}
      {required.length > 0 && (
        <div className="flex flex-col gap-1" data-testid="ha-plan-confirm">
          {required.map((key) => (
            <Checkbox key={key} label={confirmLabel[key] ?? key} checked={agreed.includes(key)} onChange={(e) => onAgree(key, e.target.checked)} />
          ))}
        </div>
      )}

      {Array.isArray(plan.warnings) && plan.warnings.length > 0 && (
        <div className="flex flex-col gap-1 text-amber-700 dark:text-amber-300" data-testid="ha-plan-warnings">
          {plan.warnings.map((text) => <span key={text}>{text}</span>)}
        </div>
      )}

      <span>{W.planSizes(megabytes(plan.backup_bytes), megabytes(plan.transfer_bytes))}</span>
      {Array.isArray(plan.process_increase) && plan.process_increase.length > 0 && (
        <span>{W.planProcesses}: {plan.process_increase.map((p) => `${p.host} +${p.copylogdb ?? 0}/+${p.applylogdb ?? 0}`).join(', ')}</span>
      )}

      <Typography variant="h4">{W.planChanges}</Typography>
      <table className="w-full border-collapse" data-testid="ha-plan-changes">
        <thead>
          <tr className="text-left text-slate-500">
            <th className={`${cell} font-medium`}>{W.colNode}</th>
            <th className={`${cell} font-medium`}>{W.colFile}</th>
            <th className={`${cell} font-medium`}>{W.colKey}</th>
            <th className={`${cell} font-medium`}>{W.colBefore}</th>
            <th className={`${cell} font-medium`}>{W.colAfter}</th>
          </tr>
        </thead>
        <tbody>
          {(plan.changes ?? []).map((c) => (
            <tr key={`${c.host}|${c.file}|${c.key}`} className="border-t border-slate-100 dark:border-white/5">
              <td className={`${cell} font-mono`}>{c.host}</td>
              <td className={`${cell} font-mono`}>{c.file}</td>
              <td className={`${cell} font-mono`}>{c.key}</td>
              <td className={`${cell} font-mono text-slate-500 break-all`}>{c.before || '-'}</td>
              <td className={`${cell} font-mono break-all`}>{c.after || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Typography variant="h4">{W.planSteps(steps.length)}</Typography>
      <ol className="flex flex-col gap-1" data-testid="ha-plan-steps">
        {steps.map((step) => (
          <li key={step.no} className="flex gap-3">
            <span className="w-8 shrink-0 text-slate-400">{step.no}</span>
            <span className="w-36 shrink-0 text-amber-700 dark:text-amber-300">{isPromoteStep(step) ? W.promoteTitle : ''}</span>
            <span className="w-72 shrink-0">{step.title || step.id}</span>
            <span className="w-28 shrink-0 font-mono text-slate-500">{step.node || ''}</span>
            <span className="w-28 shrink-0 font-mono text-slate-500">{step.db || ''}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
