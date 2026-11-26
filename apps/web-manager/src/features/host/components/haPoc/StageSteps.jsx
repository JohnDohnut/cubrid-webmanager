import React from 'react';
import { STATE_STYLE, isPromoteStep } from './haPocShared';

// The script's stages (S1..S21) in their groups, as the design's step table
// has them; the promotion (S4..S8) is there only for a single server.
const GROUP_OF_STAGE = {
  S1: 'precheck', S2: 'precheck', S3: 'precheck',
  S4: 'promote', S5: 'promote', S6: 'promote', S7: 'promote', S8: 'promote',
  S9: 'backup', S10: 'backup',
  S11: 'newConfig',
  S12: 'restore', S13: 'restore', S14: 'restore',
  S15: 'newStart', S16: 'newStart',
  S17: 'existing', S18: 'existing',
  S19: 'verify', S20: 'verify', S21: 'verify',
};

const groupOf = (step) => GROUP_OF_STAGE[step.stage] ?? (isPromoteStep(step) ? 'promote' : '');

/**
 * Steps (the plan's or a job's) under their group names, each with its stage,
 * node and database; with `states`, each step's state and detail too.
 * `promoting`: a single server's promotion is shown; on an HA host its steps
 * are left out. `groups`: the group names.
 */
export default function StageSteps({ steps, groups, promoting, states = false, testId }) {
  const shown = (steps ?? []).filter((step) => promoting || groupOf(step) !== 'promote');
  const blocks = [];
  for (const step of shown) {
    const group = groupOf(step);
    const last = blocks[blocks.length - 1];
    if (last && last.group === group) last.steps.push(step);
    else blocks.push({ group, steps: [step] });
  }
  return (
    <div className="flex flex-col gap-3 text-13" data-testid={testId}>
      {blocks.map((block) => (
        <div key={`${block.group}-${block.steps[0].no}`} className="flex flex-col gap-1" data-testid={`ha-stage-group-${block.group || 'other'}`}>
          {block.group && (
            <span className={`font-medium ${block.group === 'promote' ? 'text-amber-700 dark:text-amber-300' : ''}`}>{groups[block.group]}</span>
          )}
          <ol className="flex flex-col gap-1">
            {block.steps.map((step) => (
              <li key={step.no} className="flex gap-3">
                <span className="w-8 shrink-0 text-slate-400">{step.no}</span>
                <span className="w-10 shrink-0 text-slate-400">{step.stage || ''}</span>
                <span className="w-72 shrink-0">{step.title || step.id}</span>
                <span className="w-28 shrink-0 font-mono text-slate-500">{step.node || ''}</span>
                <span className="w-28 shrink-0 font-mono text-slate-500">{step.db || ''}</span>
                {states && <span className={`w-28 shrink-0 ${STATE_STYLE[step.state] ?? ''}`}>{step.state}</span>}
                {states && step.detail && <span className="text-slate-500 break-all">{step.detail}</span>}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
