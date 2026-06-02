import { flattenHostsFromGroups, findGroupIdForHost } from './hostGroupUtils';

export function isHaPostLoginModalOpen(hostState) {
  return Boolean(
    hostState?.isDiscoveryModalOpen
      || hostState?.isHaMergeModalOpen
      || hostState?.isHaClusterLinkModalOpen
  );
}

export function clearHaClusterLinkSessionNotices(hostUids = []) {
  for (const uid of hostUids) {
    try {
      sessionStorage.removeItem(`ha_cluster_linked_${uid}`);
    } catch {
      // ignore
    }
  }
}

const isLoopback = (addr) => {
  const value = (addr || '').trim().toLowerCase();
  return value === 'localhost' || value === '127.0.0.1';
};

const normalizeIdent = (value) => (value || '').trim().toLowerCase();

/**
 * Short name vs FQDN, e.g. `node1` ↔ `node1.example.com`.
 * Short-name fallback (first label only) is suppressed when BOTH sides are FQDNs
 * with different domain suffixes — they are distinct endpoints even if the first
 * label matches (e.g. `node1.prod.example.com` ≠ `node1.dev.example.com`).
 */
function hostnameMatches(a, b) {
  const left = normalizeIdent(a);
  const right = normalizeIdent(b);
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.endsWith(`.${right}`) || right.endsWith(`.${left}`)) return true;
  // If both carry a domain suffix, do not collapse them to their first label.
  if (left.includes('.') && right.includes('.')) return false;
  const leftShort = left.split('.')[0];
  const rightShort = right.split('.')[0];
  return leftShort.length > 0 && leftShort === rightShort;
}

/** Match saved host connection to CMS heartbeat peer (ip / hostname). */
export function hostMatchesHaPeer(host, peer) {
  const hAddr = normalizeIdent(host?.address);
  const hAlias = normalizeIdent(host?.alias);
  const nIp = normalizeIdent(peer?.ip);
  const nHost = normalizeIdent(peer?.hostname);

  // Exact identity matches (always authoritative).
  if (hAddr === nIp || hAddr === nHost) return true;

  // IP-confirmed hostname match.
  if (nIp && (hAddr === nIp || hostnameMatches(hAddr, nIp))) return true;

  // Loopback special case.
  if (isLoopback(hAddr) && (isLoopback(nIp) || isLoopback(nHost))) return true;

  // Stored address is FQDN but peer exposes only a bare short hostname (no dot):
  // the first label is too coarse — node1.prod.example.com and node1.dev.example.com
  // both reduce to "node1", so a first-label match is meaningless without IP evidence.
  // IP evidence was checked above; if we reach here it did not confirm identity.
  // Allow the match only when the host alias is itself a plain label that directly
  // names the peer (explicit user-managed short alias → explicit peer name).
  if (hAddr.includes('.') && nHost.length > 0 && !nHost.includes('.')) {
    return hAlias.length > 0 && !hAlias.includes('.') && hAlias === nHost;
  }

  return hostnameMatches(hAddr, nHost) || hostnameMatches(hAlias, nHost);
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
 * Registered peers in the same HA cluster and same group as the anchor host.
 */
export function findRegisteredHaPeersInSameGroup(hostGroups, haNodes, anchorHostUid) {
  const targetGroupId = findGroupIdForHost(hostGroups, anchorHostUid);
  if (!targetGroupId || !haNodes?.length) return [];

  const hosts = flattenHostsFromGroups(hostGroups);
  const peers = [];
  const seenUids = new Set();

  for (const node of haNodes) {
    const matched = findHostMatchingHaPeer(hosts, node, anchorHostUid);
    if (!matched || seenUids.has(matched.uid)) continue;

    const fromGroupId = findGroupIdForHost(hostGroups, matched.uid);
    if (fromGroupId !== targetGroupId) continue;

    seenUids.add(matched.uid);
    peers.push({
      hostUid: matched.uid,
      alias: matched.alias || matched.id,
      address: matched.address,
      port: matched.port,
      haRole: (node.state || '').trim().toLowerCase(),
    });
  }

  return peers;
}

/**
 * Peers in the same HA cluster (haNodes) that exist in host list but live in another group.
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
