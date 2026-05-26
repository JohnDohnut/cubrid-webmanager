import { v4 as uuidv4 } from 'uuid';
import { omitHashMap } from '@util';
import { HostGroupInfo, HostInfo, User } from '@type/index';
import { SafeHostList, SafeHostGroupsMap, SafeHostGroupInfo } from '@type/collections';

export type HostRef = {
  groupId: string;
  group: HostGroupInfo;
  host: HostInfo;
};

export function ensureHostGroups(user: User): Record<string, HostGroupInfo> {
  if (!user.host_groups) {
    user.host_groups = {};
  }
  return user.host_groups;
}

export function findHostRef(user: User, hostUid: string): HostRef | null {
  for (const [groupId, group] of Object.entries(ensureHostGroups(user))) {
    const host = group.hosts?.[hostUid];
    if (host) {
      return { groupId, group, host };
    }
  }
  return null;
}

export function getHost(user: User, hostUid: string): HostInfo | null {
  return findHostRef(user, hostUid)?.host ?? null;
}

export function countAllHosts(user: User): number {
  return Object.values(ensureHostGroups(user)).reduce(
    (n, g) => n + Object.keys(g.hosts ?? {}).length,
    0
  );
}

export function forEachHost(user: User, fn: (ref: HostRef) => void): void {
  for (const [groupId, group] of Object.entries(ensureHostGroups(user))) {
    for (const host of Object.values(group.hosts ?? {})) {
      fn({ groupId, group, host });
    }
  }
}

export function findDuplicateHost(
  user: User,
  candidate: Pick<HostInfo, 'address' | 'port' | 'id' | 'alias'>,
  excludeHostUid?: string
): HostInfo | undefined {
  let found: HostInfo | undefined;
  forEachHost(user, ({ host }) => {
    if (found || (excludeHostUid && host.uid === excludeHostUid)) return;
    const sameConnection =
      host.address === candidate.address &&
      host.port === candidate.port &&
      host.id === candidate.id;
    const sameAlias = hasSameDefinedAlias(host.alias, candidate.alias);
    if (sameConnection || sameAlias) {
      found = host;
    }
  });
  return found;
}

function hasSameDefinedAlias(a: string | undefined, b: string | undefined): boolean {
  const left = a?.trim() ?? '';
  const right = b?.trim() ?? '';
  return left !== '' && right !== '' && left === right;
}

export function sanitizeHostGroups(user: User): SafeHostGroupsMap {
  const out: SafeHostGroupsMap = {};
  for (const [groupId, group] of Object.entries(ensureHostGroups(user))) {
    out[groupId] = {
      name: group.name,
      defaultHostUid: group.defaultHostUid,
      createdAt: group.createdAt,
      hosts: omitHashMap(group.hosts ?? {}, ['password', 'token', 'dbProfiles']) as SafeHostList,
    };
  }
  return out;
}

export function createGroupWithHost(
  user: User,
  host: HostInfo,
  opts?: { name?: string }
): string {
  const groups = ensureHostGroups(user);
  const groupId = uuidv4();
  groups[groupId] = {
    name: (opts?.name ?? host.alias ?? host.id ?? 'Host').trim() || 'Host',
    defaultHostUid: host.uid,
    createdAt: new Date().toISOString(),
    hosts: { [host.uid]: host },
  };
  return groupId;
}

export function createEmptyGroup(user: User, name: string): string {
  const groups = ensureHostGroups(user);
  const groupId = uuidv4();
  const trimmed = (name ?? '').trim();
  groups[groupId] = {
    name: trimmed || 'Group',
    createdAt: new Date().toISOString(),
    hosts: {},
  };
  return groupId;
}

export function deleteGroup(user: User, groupId: string): boolean {
  const groups = ensureHostGroups(user);
  if (!groups[groupId]) return false;
  delete groups[groupId];
  return true;
}

export function updateGroup(
  user: User,
  groupId: string,
  patch: { name?: string; defaultHostUid?: string | null }
): boolean {
  const groups = ensureHostGroups(user);
  const group = groups[groupId];
  if (!group) return false;

  if (patch.name !== undefined) {
    const trimmed = String(patch.name ?? '').trim();
    if (!trimmed) {
      throw new Error('BLANK_GROUP_NAME_NOT_ALLOWED');
    }
    group.name = trimmed;
  }

  if (patch.defaultHostUid !== undefined) {
    const next = patch.defaultHostUid ?? undefined;
    if (next && !group.hosts?.[next]) {
      throw new Error('DEFAULT_HOST_NOT_IN_GROUP');
    }
    group.defaultHostUid = next;
  }

  return true;
}

export function addHostToGroup(user: User, groupId: string, host: HostInfo): void {
  const groups = ensureHostGroups(user);
  const group = groups[groupId];
  if (!group) {
    throw new Error(`Host group not found: ${groupId}`);
  }
  if (!group.hosts) {
    group.hosts = {};
  }
  group.hosts[host.uid] = host;
  if (!group.defaultHostUid) {
    group.defaultHostUid = host.uid;
  }
}

export function removeHostFromUser(user: User, hostUid: string): boolean {
  const ref = findHostRef(user, hostUid);
  if (!ref) return false;
  delete ref.group.hosts[hostUid];
  if (ref.group.defaultHostUid === hostUid) {
    const remaining = Object.values(ref.group.hosts);
    ref.group.defaultHostUid = remaining[0]?.uid;
  }
  if (Object.keys(ref.group.hosts).length === 0) {
    delete user.host_groups[ref.groupId];
  }
  return true;
}

export function findHostMatchingPeer(
  user: User,
  peer: { ip?: string; hostname?: string }
): HostRef | null {
  const nIp = (peer.ip || '').toLowerCase();
  const nHost = (peer.hostname || '').toLowerCase();
  const isLoopback = (addr: string) => addr === 'localhost' || addr === '127.0.0.1';

  let match: HostRef | null = null;
  forEachHost(user, (ref) => {
    if (match) return;
    const hAddr = (ref.host.address || '').toLowerCase();
    if (hAddr === nIp || hAddr === nHost) {
      match = ref;
      return;
    }
    if (isLoopback(hAddr) && (isLoopback(nIp) || isLoopback(nHost))) {
      match = ref;
    }
  });
  return match;
}
