import { LoadDatabaseRequest } from '@api-interfaces';
import { normalizeLoadDatabaseRequest } from './normalize-load-database-request';

describe('normalizeLoadDatabaseRequest', () => {
  const base: LoadDatabaseRequest = {
    checkoption: 'none',
    period: 'none',
    user: 'dba',
    estimated: 'none',
    oiduse: 'no',
    statisticsuse: 'no',
    nolog: 'no',
    schema: '/s',
    object: '/o',
    index: 'none',
    errorcontrolfile: 'none',
    ignoreclassfile: 'none',
  };

  it('mirrors user into _DBID and always sets _DBPASSWD', () => {
    expect(normalizeLoadDatabaseRequest({ ...base, user: 'appuser', _DBPASSWD: 'pw' })).toEqual({
      ...base,
      user: 'appuser',
      _DBID: 'appuser',
      _DBPASSWD: 'pw',
    });
  });

  it('fills user from _DBID when user is omitted', () => {
    const { user, _DBID, _DBPASSWD } = normalizeLoadDatabaseRequest({
      ...base,
      user: undefined as unknown as string,
      _DBID: 'legacy',
    });
    expect(user).toBe('legacy');
    expect(_DBID).toBe('legacy');
    expect(_DBPASSWD).toBe('');
  });
});
