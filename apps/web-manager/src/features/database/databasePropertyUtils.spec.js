import { describe, expect, it } from 'vitest';
import { getModifiedKeys } from './databasePropertyUtils';

describe('getModifiedKeys', () => {
  it('does not report values loaded from the server as modified', () => {
    const loaded = { max_clients: '100', auto_restart_server: 'no' };

    expect(getModifiedKeys(loaded, { ...loaded })).toEqual([]);
  });

  it('reports edited, added, and removed values', () => {
    const loaded = { max_clients: '100', replication: 'no' };
    const draft = { max_clients: '200', new_parameter: 'yes' };

    expect(getModifiedKeys(loaded, draft)).toEqual([
      'max_clients',
      'replication',
      'new_parameter',
    ]);
  });

  it('clears the change when a value is restored', () => {
    const loaded = { max_clients: '100' };
    const edited = { max_clients: '200' };

    expect(getModifiedKeys(loaded, edited)).toEqual(['max_clients']);
    expect(getModifiedKeys(loaded, { max_clients: '100' })).toEqual([]);
  });

  it('does not report a key as modified when retyped to match its schema default', () => {
    // csql_history_num was never explicitly in the conf file (absent from
    // `loaded`); the field shows the schema default as a placeholder/value.
    // Retyping that exact default should not count as a real change.
    const loaded = {};
    const defaults = { csql_history_num: '50' };

    expect(getModifiedKeys(loaded, { csql_history_num: '50' }, defaults)).toEqual([]);
    expect(getModifiedKeys(loaded, { csql_history_num: '75' }, defaults)).toEqual(['csql_history_num']);
  });

  it('still reports a genuinely loaded value as modified regardless of the schema default', () => {
    const loaded = { csql_history_num: '30' };
    const defaults = { csql_history_num: '50' };

    // Retyping the SCHEMA default here is a real change — the conf file's
    // own explicit value (30) differs from it.
    expect(getModifiedKeys(loaded, { csql_history_num: '50' }, defaults)).toEqual(['csql_history_num']);
    // Restoring the conf file's own explicit value clears the change.
    expect(getModifiedKeys(loaded, { csql_history_num: '30' }, defaults)).toEqual([]);
  });

  it('clears the change when a never-set key is typed into and then cleared back to blank', () => {
    const loaded = {};
    const defaults = { csql_history_num: '50' };

    expect(getModifiedKeys(loaded, { csql_history_num: '75' }, defaults)).toEqual(['csql_history_num']);
    // Cleared back out — still matches the original "never set" state,
    // regardless of what the (non-blank) schema default happens to be.
    expect(getModifiedKeys(loaded, { csql_history_num: '' }, defaults)).toEqual([]);
  });

  it('still reports a genuinely loaded value cleared to blank as modified', () => {
    const loaded = { csql_history_num: '30' };
    const defaults = { csql_history_num: '50' };

    expect(getModifiedKeys(loaded, { csql_history_num: '' }, defaults)).toEqual(['csql_history_num']);
  });
});
