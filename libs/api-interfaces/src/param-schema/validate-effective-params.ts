import { ParamSchemaEntry } from './param-schema-entry';
import { validateParamValue } from './validate-param-value';
import { validateCrossFieldParams } from './validate-cross-field-params';

export interface ValidateEffectiveParamsOptions {
  /** Is the section being validated the shared one ([common] / [broker])? */
  isCommonSection: boolean;
  /** How to name that shared section in a message, e.g. "common" or "broker". */
  commonSectionLabel: string;
}

/**
 * The single rule engine for "is this section's full effective parameter
 * set valid" — every call site that needs to check a conf section against
 * the schema (table-mode inline errors, the raw editor's per-section
 * checks, and the server's post-merge validation) goes through this one
 * function instead of re-assembling the same checks by hand. Before this
 * existed, required/guard/section-placement/cross-field were each
 * duplicated across 4-6 places (two frontend modals, two raw editors, two
 * backend methods) that had to be kept in sync by hand — this is that
 * consolidation.
 *
 * `effectiveParams` must be the FULL current value for every key that
 * matters, not a partial diff — i.e. schema defaults already merged in
 * for anything not explicitly set (`{...defaults, ...actualValues}`).
 * That's what makes `required` (a key genuinely absent is
 * indistinguishable from "its default happens to be blank") and
 * `crossField` (needs both sides' real values) actually checkable here.
 *
 * Checks run per key, in order, first failure wins for that key:
 * 1. Section placement (`commonOnly` in a non-common section /
 *    `instanceOnly` in the common section) — checked FIRST and only as a
 *    violation when the key actually HAS a value here; a commonOnly key
 *    sitting blank in an instance section (or vice versa) is the normal,
 *    expected case (it simply doesn't live here), not an error, and must
 *    be recognized before the required check below even looks at it —
 *    otherwise a commonOnly `required` key (e.g. broker.conf's
 *    MASTER_SHM_ID) would wrongly be flagged "missing" in every instance
 *    section it was never supposed to be in to begin with.
 * 2. `required` + blank, for a key that DOES belong in this section — no
 *    safe engine fallback at all.
 * 3. `guard` (via `validateParamValue`).
 * Then `crossField` relationships are checked across the whole set,
 * filling in only keys that don't already have an error from 1-3.
 *
 * Unknown keys (not in `schema` at all) are silently ignored — this
 * function only ever validates keys it has schema coverage for; callers
 * that need to reject a request containing a truly unknown key (e.g. a
 * typo) do that separately, since "unknown" is a property of a specific
 * request's own diff, not of a section's full effective state.
 */
export function validateEffectiveParams(
  schema: ParamSchemaEntry[],
  effectiveParams: Record<string, unknown>,
  options: ValidateEffectiveParamsOptions
): Record<string, string> {
  const { isCommonSection, commonSectionLabel } = options;
  const errors: Record<string, string> = {};

  for (const entry of schema) {
    const raw = effectiveParams[entry.key];
    const isBlank = raw === undefined || raw === null || String(raw).trim() === '';
    const belongsHere = !(entry.commonOnly && !isCommonSection) && !(entry.instanceOnly && isCommonSection);

    if (!belongsHere) {
      // Wrong section for this key — but only a real problem if it's
      // actually set here. Blank just means it's (correctly) absent from
      // a section it was never meant to be in.
      if (!isBlank) {
        errors[entry.key] = entry.commonOnly
          ? `Can only be set in [${commonSectionLabel}], not per-instance.`
          : `Cannot be set in [${commonSectionLabel}], only per-instance.`;
      }
      continue;
    }

    if (entry.required && isBlank) {
      errors[entry.key] = 'This parameter is required and cannot be left blank.';
      continue;
    }
    if (isBlank) continue; // nothing else to check for an absent/blank optional key

    const reason = validateParamValue(entry.guard, raw);
    if (reason) errors[entry.key] = reason;
  }

  for (const [key, reason] of Object.entries(validateCrossFieldParams(schema, effectiveParams))) {
    if (!errors[key]) errors[key] = reason;
  }

  return errors;
}
