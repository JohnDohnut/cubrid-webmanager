import { describe, expect, it } from 'vitest';
import { validateEffectiveParams } from '@api-interfaces';

// A trimmed-down stand-in for BROKER_PARAM_SCHEMA covering just the
// shapes that matter here: a commonOnly+required key (MASTER_SHM_ID), an
// instanceOnly+required key (BROKER_PORT), and a crossField pair
// (MIN/MAX_NUM_APPL_SERVER) - mirrors the real schema closely enough to
// catch the exact regression this guards against.
const SCHEMA = [
  { key: 'MASTER_SHM_ID', guard: { kind: 'int', min: 1 }, default: '', commonOnly: true, required: true },
  { key: 'BROKER_PORT', guard: { kind: 'int', min: 1, max: 65535 }, default: '', instanceOnly: true, required: true },
  { key: 'MIN_NUM_APPL_SERVER', guard: { kind: 'int', min: 1 }, default: '5' },
  { key: 'MAX_NUM_APPL_SERVER', guard: { kind: 'int', min: 1, max: 4096 }, default: '40', crossField: { comparedToKey: 'MIN_NUM_APPL_SERVER', rule: 'gte' } },
];

const defaults = Object.fromEntries(SCHEMA.map(e => [e.key, e.default]));

describe('validateEffectiveParams', () => {
  it('does not flag a required commonOnly key as missing while validating an instance section', () => {
    // MASTER_SHM_ID genuinely has no value here - it belongs in [broker],
    // not this broker's own section - so its blank default must NOT read
    // as "required and missing" just because this is an instance section.
    const effectiveParams = { ...defaults, BROKER_PORT: '30000' };
    const errors = validateEffectiveParams(SCHEMA, effectiveParams, {
      isCommonSection: false,
      commonSectionLabel: 'broker',
    });
    expect(errors).toEqual({});
  });

  it('does not flag a required instanceOnly key as missing while validating the common section', () => {
    const effectiveParams = { ...defaults, MASTER_SHM_ID: '30001' };
    const errors = validateEffectiveParams(SCHEMA, effectiveParams, {
      isCommonSection: true,
      commonSectionLabel: 'broker',
    });
    expect(errors).toEqual({});
  });

  it('still flags a required key genuinely blank in the section it belongs to', () => {
    const effectiveParams = { ...defaults, BROKER_PORT: '' };
    const errors = validateEffectiveParams(SCHEMA, effectiveParams, {
      isCommonSection: false,
      commonSectionLabel: 'broker',
    });
    expect(errors.BROKER_PORT).toBeTruthy();
  });

  it('still flags a commonOnly key actually set in an instance section', () => {
    const effectiveParams = { ...defaults, BROKER_PORT: '30000', MASTER_SHM_ID: '30001' };
    const errors = validateEffectiveParams(SCHEMA, effectiveParams, {
      isCommonSection: false,
      commonSectionLabel: 'broker',
    });
    expect(errors.MASTER_SHM_ID).toBeTruthy();
  });

  it('flags a cross-field violation using effective (default-backed) values', () => {
    const effectiveParams = { ...defaults, BROKER_PORT: '30000', MAX_NUM_APPL_SERVER: '3' };
    const errors = validateEffectiveParams(SCHEMA, effectiveParams, {
      isCommonSection: false,
      commonSectionLabel: 'broker',
    });
    expect(errors.MAX_NUM_APPL_SERVER).toBeTruthy();
  });
});
