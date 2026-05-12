import { formatAuditLog } from './format-audit-log';

describe('formatAuditLog', () => {
  it('formats header fields and indented payload lines', () => {
    const formatted = formatAuditLog('http_request', {
      user: 'alice',
      ip: '203.0.113.10',
      method: 'POST',
      address: '/hosts/1/database/users',
      body: { password: 'secret', name: 'alice' },
    });

    expect(formatted).toContain('[http_request] user=alice | ip=203.0.113.10 | method=POST');
    expect(formatted).toContain('body: {');
    expect(formatted).toContain('"password": "[REDACTED]"');
    expect(formatted).not.toContain('password=secret');
  });

  it('omits empty request bodies', () => {
    const formatted = formatAuditLog('http_request', {
      user: 'anonymous',
      ip: '127.0.0.1',
      method: 'GET',
      address: '/health',
      body: {},
    });

    expect(formatted).not.toContain('body:');
  });
});
