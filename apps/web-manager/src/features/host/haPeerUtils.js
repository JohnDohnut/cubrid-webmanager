import { flattenHostsFromGroups, findGroupIdForHost } from './hostGroupUtils';

const isLoopback = (addr) => {
  const value = (addr || '').toLowerCase();
  return value === 'localhost' || value === '127.0.0.1';
};

/** Match saved host connection to CMS heartbeat peer (ip / hostname). */
export function hostMatchesHaPeer(host, peer) {
  const hAddr = (host?.address || '').toLowerCase();
  const nIp = (peer?.ip || '').toLowerCase();
  const nHost = (peer?.hostname || '').toLowerCase();
  if (hAddr === nIp || hAddr === nHost) return true;
  return isLoopback(hAddr) && (isLoopback(nIp) || isLoopback(nHost));
}

export function findHostMatchingHaPeer(hosts, peer, excludeHostUid) {
  return hosts.find((host) => {
    if (excludeHostUid && host.uid === excludeHostUid) return false;
    return hostMatchesHaPeer(host, peer);
  });
}

/** HA nodes from login that are not yet registered as hosts. */
export function findUndiscoveredHaPeers(hosts, haNodes) {
  return (haNodes || []).filter((node) => !findHostMatchingHaPeer(hosts, node));
}

/**
 * Peers in the same HA cluster (haNodes) that exist in host list but live in another group.
 * Cluster boundary = CMS heartbeat list for the anchor host only.
 */
export function findHaPeersNeedingMerge(hostGroups, haNodes, anchorHostUid) {
  const targetGroupId = findGroupIdForHost(hostGroups, anchorHostUid);
  if (!targetGroupId || !haNodes?.length) return null;

  const hosts = flattenHostsFromGroups(hostGroups);
  const targetGroupName = hostGroups[targetGroupId]?.name || 'Group';
  const peers = [];
  const seenUids = new Set();

  for (const node of haNodes) {
    const matched = findHostMatchingHaPeer(hosts, node, anchorHostUid);
    if (!matched || seenUids.has(matched.uid)) continue;
    seenUids.add(matched.uid);

    const fromGroupId = findGroupIdForHost(hostGroups, matched.uid);
    if (fromGroupId && fromGroupId !== targetGroupId) {
      peers.push({
        hostUid: matched.uid,
        alias: matched.alias || matched.id,
        address: matched.address,
        port: matched.port,
        fromGroupId,
        fromGroupName: hostGroups[fromGroupId]?.name || 'Group',
        haRole: (node.state || '').trim().toLowerCase(),
      });
    }
  }

  if (peers.length === 0) return null;

  return {
    anchorHostUid,
    targetGroupId,
    targetGroupName,
    peers,
  };
}
