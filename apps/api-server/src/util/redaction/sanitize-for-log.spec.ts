import { REDACTED_VALUE, sanitizeForLog } from './sanitize-for-log';

describe('sanitizeForLog', () => {
  it('redacts sensitive keys at any depth', () => {
    const sanitized = sanitizeForLog({
      task: 'userverify',
      dbname: 'demodb',
      dbuser: 'dba',
      dbpasswd: 'secret',
      profile: {
        password: 'secret',
        token: 'abc',
      },
    });

    expect(sanitized).toEqual({
      task: 'userverify',
      dbname: 'demodb',
      dbuser: 'dba',
      dbpasswd: REDACTED_VALUE,
      profile: {
        password: REDACTED_VALUE,
        token: REDACTED_VALUE,
      },
    });
  });

  it('redacts sensitive values inside arrays', () => {
    const sanitized = sanitizeForLog([
      { userpass: 'secret', username: 'dba' },
      { authorization: 'Bearer token' },
    ]);

    expect(sanitized).toEqual([
      { userpass: REDACTED_VALUE, username: 'dba' },
      { authorization: REDACTED_VALUE },
    ]);
  });
});
