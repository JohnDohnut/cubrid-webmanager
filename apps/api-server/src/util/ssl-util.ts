import * as fs from 'fs';
import * as path from 'path';
import * as selfsigned from 'selfsigned';

/**
 * Retrieves existing SSL certificates or generates new self-signed certificates if they don't exist.
 * Certificates are stored in an 'ssl' directory relative to the executable path (for pkg) or project root.
 *
 * @returns An object containing the SSL key and certificate.
 * @category Utilities
 * @since 1.0.0
 */
export function getOrCreateSSLCert() {
  const isPkg = !!(process as any).pkg;
  const baseDir = isPkg ? path.dirname(process.execPath) : path.resolve(__dirname, '..');

  const sslDir = path.join(baseDir, 'ssl');
  const certPath = path.join(sslDir, 'cert.pem');
  const keyPath = path.join(sslDir, 'key.pem');

  console.log('is running pack : ', isPkg);
  console.log('\t@ baseDir : ', baseDir);
  console.log('\t@ sslDir : ', sslDir);
  console.log('\t@ certPath : ', certPath);
  console.log('\t@ keyPath : ', keyPath);

  const certExtensions = [
    {
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: 'localhost' },
        { type: 7, ip: '127.0.0.1' },
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
    console.log('SSL created');
  }

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
}
