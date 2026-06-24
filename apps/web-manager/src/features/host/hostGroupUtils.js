/** Flatten nested host_groups into a host array (no groupId on host objects). */
export function flattenHostsFromGroups(hostGroups) {
  const hosts = [];
  if (!hostGroups) return hosts;
  for (const group of Object.values(hostGroups)) {
    for (const host of Object.values(group.hosts || {})) {
      hosts.push(host);
    }
  }
  return hosts;
}

export function findGroupIdForHost(hostGroups, hostUid) {
  if (!hostGroups || !hostUid) return null;
  for (const [groupId, group] of Object.entries(hostGroups)) {
    if (group.hosts?.[hostUid]) return groupId;
  }
  return null;
}

/** Group id present in `nextGroups` but not in `previousGroups` (e.g. after createHostGroup). */
export function findNewGroupId(previousGroups, nextGroups) {
  const prev = new Set(Object.keys(previousGroups || {}));
  return Object.keys(nextGroups || {}).find((id) => !prev.has(id)) ?? null;
}

export function getGroupHostUids(group) {
  return Object.keys(group?.hosts || {});
}

/** Host UIDs in one group or entire tree that are not CMS-logged-in yet. */
export function getUnauthorizedHostUids(hostGroups, authorizedHosts, groupId = null) {
  const authorized = new Set(authorizedHosts || []);
  const uids = [];

  const groups = groupId
    ? (hostGroups?.[groupId] ? [[groupId, hostGroups[groupId]]] : [])
    : Object.entries(hostGroups || {});

  for (const [, group] of groups) {
    for (const uid of Object.keys(group?.hosts || {})) {
      if (!authorized.has(uid)) uids.push(uid);
    }
  }
  return uids;
}

export function resolveDefaultHostUid(group) {
  if (!group) return null;
  if (group.defaultHostUid && group.hosts?.[group.defaultHostUid]) {
    return group.defaultHostUid;
  }
  const uids = getGroupHostUids(group);
  return uids[0] ?? null;
}

export function orderedGroupEntries(hostGroups) {
  return Object.entries(hostGroups || {}).sort(([, a], [, b]) =>
    (a.name || '').localeCompare(b.name || '')
  );
}

const HA_ROLE_SORT_ORDER = { master: 0, slave: 1, replica: 2 };

/** HA role from Redux haInfo or alias suffix (master)/(slave)/(replica). */
export function inferHaNodeType(host, haInfoEntry) {
  const fromStore = haInfoEntry?.isHA ? haInfoEntry.currentNodeType : null;
  if (fromStore && HA_ROLE_SORT_ORDER[fromStore] !== undefined) return fromStore;

  const alias = (host?.alias || '').toLowerCase();
  if (alias.includes('(master)')) return 'master';
  if (alias.includes('(slave)')) return 'slave';
  if (alias.includes('(replica)')) return 'replica';
  return null;
}

/** Sort host UIDs within a group: master → slave → replica → unknown (then alias). */
export function sortHostUidsByHaRole(hostUids, hostsByUid, haInfoByUid = {}) {
  const roleRank = (uid) => {
    const role = inferHaNodeType(hostsByUid?.[uid], haInfoByUid[uid]);
    return role != null && HA_ROLE_SORT_ORDER[role] !== undefined
      ? HA_ROLE_SORT_ORDER[role]
      : 99;
  };
  const label = (uid) =>
    (hostsByUid?.[uid]?.alias || hostsByUid?.[uid]?.id || uid).toLowerCase();

  return [...hostUids].sort((a, b) => {
    const byRole = roleRank(a) - roleRank(b);
    if (byRole !== 0) return byRole;
    return label(a).localeCompare(label(b));
  });
}
