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

export function getGroupHostUids(group) {
  return Object.keys(group?.hosts || {});
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
