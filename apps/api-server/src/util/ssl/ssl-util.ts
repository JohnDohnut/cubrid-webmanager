import * as fs from 'fs';
import * as path from 'path';
import * as selfsigned from 'selfsigned';

export type HttpsKeyCert = { key: Buffer; cert: Buffer };

/**
 * Production: reads PEM paths from `SSL_CERT_PATH` and `SSL_KEY_PATH` (e.g. under `/etc`).
 * Non-production: self-signed certs next to the executable / project (see `getOrCreateSSLCert`).
 */
export function getHttpsOptions(): HttpsKeyCert {
  const certPath = process.env.SSL_CERT_PATH?.trim();
  const keyPath = process.env.SSL_KEY_PATH?.trim();

  if (certPath && keyPath && fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    return {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    };
  }

  // 경로 미지정 또는 파일 없을 때 자동 생성 (production 포함)
  return getOrCreateSSLCert();
}

/**
 * Retrieves existing SSL certificates or generates new self-signed certificates if they don't exist.
 * Certificates are stored in an 'ssl' directory relative to the executable path (for pkg) or project root.
 *
 * @returns An object containing the SSL key and certificate.
 * @category Utilities
 * @since 1.0.0
 */
function resolveSslDir(): string {
  const configured = process.env.CWM_SSL_DIR?.trim();
  if (configured) {
    return path.resolve(configured);
  }


  const isPkg = !!(process as any).pkg;
  const baseDir = isPkg ? path.dirname(process.execPath) : path.resolve(__dirname, '..', '..');
  return path.join(baseDir, 'ssl');
}

export function getOrCreateSSLCert(): HttpsKeyCert {
  const sslDir = resolveSslDir();
  const certPath = path.join(sslDir, 'cert.pem');
  const keyPath = path.join(sslDir, 'key.pem');

  console.log('\t@ sslDir : ', sslDir);
  console.log('\t@ certPath : ', certPath);
  console.log('\t@ keyPath : ', keyPath);

  // Get server IP from environment or network interfaces
  const getServerIPs = (): string[] => {
    const ips: string[] = ['127.0.0.1']; // Always include localhost

    // Try to get IP from environment variable
    const envIP = process.env.SERVER_IP;
    if (envIP) {
      ips.push(envIP);
    }

    // Try to get IPs from network interfaces
    try {
      const os = require('os');
      const interfaces = os.networkInterfaces();
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
          // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
          if (iface.family === 'IPv4' && !iface.internal) {
            ips.push(iface.address);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get network interfaces:', error);
    }

    // Remove duplicates
    return [...new Set(ips)];
  };

  const serverIPs = getServerIPs();
  console.log('Server IPs for SSL certificate:', serverIPs);

  const certExtensions = [
    {
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: 'localhost' },
        ...serverIPs.map((ip) => ({ type: 7, ip })),
      ],
    },
  ];

  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    if (!fs.existsSync(sslDir)) fs.mkdirSync(sslDir);
    const pems = selfsigned.generate([{ name: 'commonName', value: 'localhost' }], {
      days: 365,
      algorithm: 'sha256',
      keySize: 2048,
      extensions: certExtensions,
    });
    fs.writeFileSync(certPath, pems.cert);
    fs.writeFileSync(keyPath, pems.private);
    console.log('SSL created with IPs:', serverIPs);
  } else {
    // Check if certificate needs to be regenerated with new IPs
    // For now, we'll just log - in production you might want to check cert validity
    console.log('Using existing SSL certificate');
  }

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
}
