import { expect, it } from 'vitest';
import { pathProblems } from './haPocShared';

it('splits a plan check failure by path, and leaves other texts alone', () => {
  expect(pathProblems('haslave cannot write: /d/ha_add_nodes_backup (/d is not writable) /d/hadb (/d is not writable) ')).toEqual([
    { path: '/d/ha_add_nodes_backup', why: '/d is not writable' },
    { path: '/d/hadb', why: '/d is not writable' },
  ]);
  expect(pathProblems('haslave: not enough room for the backup under /d (10 bytes free, about 99 needed)')).toBeNull();
  expect(pathProblems('')).toBeNull();
});
