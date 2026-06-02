import { resolveClientIp } from './resolve-client-ip';

describe('resolveClientIp', () => {
  it('prefers the first x-forwarded-for address', () => {
    const ip = resolveClientIp({
      headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' },
      ip: '127.0.0.1',
    });

    expect(ip).toBe('203.0.113.10');
  });

  it('falls back to x-real-ip and socket address', () => {
    expect(
      resolveClientIp({
        headers: { 'x-real-ip': '198.51.100.4' },
      })
    ).toBe('198.51.100.4');

    expect(
      resolveClientIp({
        socket: { remoteAddress: '::1' },
      })
    ).toBe('::1');
  });
});
