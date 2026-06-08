import { hostMatchesHaPeer, findUndiscoveredHaPeers, findHaPeersNeedingMerge } from './haPeerUtils';

// hostnameMatches is internal — exercised via hostMatchesHaPeer

describe('hostnameMatches (via hostMatchesHaPeer)', () => {
  const peer = (hostname, ip = '') => ({ hostname, ip });
  const host = (address, alias = '') => ({ address, alias });

  describe('exact match', () => {
    it('matches identical hostnames', () => {
      expect(hostMatchesHaPeer(host('node1'), peer('node1'))).toBe(true);
    });
    it('matches identical FQDNs', () => {
      expect(hostMatchesHaPeer(host('node1.example.com'), peer('node1.example.com'))).toBe(true);
    });
  });

  describe('FQDN ↔ short-name fallback', () => {
    it('short name matches FQDN', () => {
      expect(hostMatchesHaPeer(host('node1'), peer('node1.example.com'))).toBe(true);
    });
    it('FQDN stored + short peer does NOT match without IP (cross-cluster ambiguity)', () => {
      expect(hostMatchesHaPeer(host('node1.example.com'), peer('node1'))).toBe(false);
    });
  });

  describe('FQDN suffix containment', () => {
    it('subdomain of peer hostname matches', () => {
      expect(hostMatchesHaPeer(host('node1.example.com'), peer('example.com'))).toBe(false);
    });
    it('peer is subdomain of host address', () => {
      expect(hostMatchesHaPeer(host('example.com'), peer('node1.example.com'))).toBe(false);
    });
  });

  describe('FQDN vs FQDN with different suffixes — must NOT match', () => {
    it('node1.prod.example.com ≠ node1.dev.example.com', () => {
      expect(hostMatchesHaPeer(host('node1.prod.example.com'), peer('node1.dev.example.com'))).toBe(false);
    });
    it('node1.cluster-a.internal ≠ node1.cluster-b.internal', () => {
      expect(hostMatchesHaPeer(host('node1.cluster-a.internal'), peer('node1.cluster-b.internal'))).toBe(false);
    });
    it('db1.prod.corp ≠ db1.staging.corp', () => {
      expect(hostMatchesHaPeer(host('db1.prod.corp'), peer('db1.staging.corp'))).toBe(false);
    });
  });

  describe('FQDN stored, peer reports only short hostname', () => {
    // Without IP evidence we cannot know whether "node1" belongs to
    // node1.prod.example.com or node1.dev.example.com; blocking is safer
    // than producing false merge/discovery proposals.
    it('node1.example.com does NOT match short peer "node1" without IP', () => {
      expect(hostMatchesHaPeer(host('node1.example.com'), peer('node1'))).toBe(false);
    });
    it('node1.prod.example.com does NOT match short peer "node1" without IP', () => {
      expect(hostMatchesHaPeer(host('node1.prod.example.com'), peer('node1'))).toBe(false);
    });
    it('FQDN stored + short peer + IP match → matches via IP', () => {
      expect(hostMatchesHaPeer(host('10.0.0.1'), peer('node1', '10.0.0.1'))).toBe(true);
    });
    it('short stored address + FQDN peer → matches (reverse direction is safe)', () => {
      expect(hostMatchesHaPeer(host('node1'), peer('node1.prod.example.com'))).toBe(true);
    });
  });

  describe('alias is not used as endpoint identity', () => {
    it('alias "node1" on FQDN host does not match short peer "node1"', () => {
      expect(hostMatchesHaPeer(host('node1.prod.example.com', 'node1'), peer('node1'))).toBe(false);
    });
    it('alias "node1" does not match unrelated FQDN peer', () => {
      expect(hostMatchesHaPeer(host('node1.prod.example.com', 'node1'), peer('node1.dev.example.com'))).toBe(false);
    });
  });

  describe('IP matching', () => {
    it('matches by IP when address equals peer ip', () => {
      expect(hostMatchesHaPeer(host('10.0.0.1'), peer('node1', '10.0.0.1'))).toBe(true);
    });
    it('does not match on unrelated IP', () => {
      expect(hostMatchesHaPeer(host('10.0.0.1'), peer('node1', '10.0.0.2'))).toBe(false);
    });
  });

  describe('loopback', () => {
    it('localhost ↔ 127.0.0.1 match', () => {
      expect(hostMatchesHaPeer(host('localhost'), peer('node1', '127.0.0.1'))).toBe(true);
    });
    it('127.0.0.1 ↔ localhost match', () => {
      expect(hostMatchesHaPeer(host('127.0.0.1'), peer('localhost', ''))).toBe(true);
    });
  });
});

describe('findUndiscoveredHaPeers', () => {
  it('returns nodes not already registered', () => {
    const hosts = [{ uid: 'h1', address: 'node1', alias: '' }];
    const nodes = [
      { hostname: 'node1', ip: '' },
      { hostname: 'node2', ip: '' },
    ];
    expect(findUndiscoveredHaPeers(hosts, nodes)).toHaveLength(1);
    expect(findUndiscoveredHaPeers(hosts, nodes)[0].hostname).toBe('node2');
  });

  it('does not suppress node1.dev when node1.prod is registered', () => {
    const hosts = [{ uid: 'h1', address: 'node1.prod.example.com', alias: '' }];
    const nodes = [
      { hostname: 'node1.prod.example.com', ip: '' },
      { hostname: 'node1.dev.example.com', ip: '' },
    ];
    const undiscovered = findUndiscoveredHaPeers(hosts, nodes);
    expect(undiscovered).toHaveLength(1);
    expect(undiscovered[0].hostname).toBe('node1.dev.example.com');
  });
});

describe('findHaPeersNeedingMerge', () => {
  const groups = {
    'g1': { name: 'Prod', hosts: { h1: { address: 'node1.prod.example.com', alias: '', uid: 'h1' } } },
    'g2': { name: 'Dev',  hosts: { h2: { address: 'node1.dev.example.com',  alias: '', uid: 'h2' } } },
  };

  it('does not propose cross-cluster merge when FQDNs differ', () => {
    const nodes = [{ hostname: 'node1.prod.example.com', ip: '', state: 'master' }];
    const result = findHaPeersNeedingMerge(groups, nodes, 'h1');
    // h2 has a different FQDN suffix — should NOT be flagged as a peer needing merge
    expect(result).toBeNull();
  });
});
