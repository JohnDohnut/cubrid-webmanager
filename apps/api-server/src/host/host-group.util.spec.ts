import { User } from '@type/index';
import { moveHostToGroup, findHostRef } from './host-group.util';

function makeUser(groups: User['host_groups']): User {
  return { host_groups: groups } as User;
}

describe('moveHostToGroup', () => {
  const hostA = {
    uid: 'host-a',
    address: '10.0.0.1',
    port: 33000,
    id: 'dba',
    alias: 'A',
    password: 'pw',
    initialLogin: false,
    dbProfiles: {},
  };
  const hostB = {
    uid: 'host-b',
    address: '10.0.0.2',
    port: 33000,
    id: 'dba',
    alias: 'B',
    password: 'pw',
    initialLogin: false,
    dbProfiles: {},
  };

  it('returns false when host is not found', () => {
    const user = makeUser({});
    expect(moveHostToGroup(user, 'missing', 'group-2')).toBe(false);
  });

  it('returns false when target group does not exist', () => {
    const user = makeUser({
      'group-1': {
        name: 'G1',
        defaultHostUid: 'host-a',
        hosts: { 'host-a': hostA },
      },
    });
    expect(moveHostToGroup(user, 'host-a', 'group-missing')).toBe(false);
    expect(findHostRef(user, 'host-a')?.groupId).toBe('group-1');
  });

  it('is a no-op when host is already in the target group', () => {
    const user = makeUser({
      'group-1': {
        name: 'G1',
        defaultHostUid: 'host-a',
        hosts: { 'host-a': hostA },
      },
    });
    expect(moveHostToGroup(user, 'host-a', 'group-1')).toBe(true);
    expect(user.host_groups!['group-1'].hosts!['host-a']).toBe(hostA);
  });

  it('moves host to target group and reassigns default on source', () => {
    const user = makeUser({
      'group-1': {
        name: 'G1',
        defaultHostUid: 'host-a',
        hosts: { 'host-a': hostA, 'host-b': hostB },
      },
      'group-2': {
        name: 'G2',
        hosts: { },
      },
    });

    expect(moveHostToGroup(user, 'host-a', 'group-2')).toBe(true);
    expect(user.host_groups!['group-1'].defaultHostUid).toBe('host-b');
    expect(user.host_groups!['group-1'].hosts!['host-a']).toBeUndefined();
    expect(user.host_groups!['group-2'].hosts!['host-a']).toBe(hostA);
    expect(user.host_groups!['group-2'].defaultHostUid).toBe('host-a');
  });

  it('deletes source group when it becomes empty', () => {
    const user = makeUser({
      'group-1': {
        name: 'G1',
        defaultHostUid: 'host-a',
        hosts: { 'host-a': hostA },
      },
      'group-2': {
        name: 'G2',
        hosts: {},
      },
    });

    expect(moveHostToGroup(user, 'host-a', 'group-2')).toBe(true);
    expect(user.host_groups!['group-1']).toBeUndefined();
    expect(user.host_groups!['group-2'].hosts!['host-a']).toBe(hostA);
  });
});
