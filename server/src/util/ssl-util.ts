// src/ssl-util.ts
import * as fs from 'fs';
import * as path from 'path';
import * as selfsigned from 'selfsigned';

/**
 * Retrieves existing SSL certificates or generates new self-signed certificates if they don't exist.
 * Certificates are stored in an 'ssl' directory relative to the executable path (for pkg) or project root.
 *
 * 기존 SSL 인증서를 검색하거나, 존재하지 않는 경우 새 자체 서명 인증서를 생성합니다.
 * 인증서는 실행 파일 경로(pkg의 경우) 또는 프로젝트 루트를 기준으로 'ssl' 디렉토리에 저장됩니다.
 *
 * @returns An object containing the SSL key and certificate.
 * @category Utilities
 * @since 1.0.0
 */
export function getOrCreateSSLCert() {
    const isPkg = !!(process as any).pkg;
    const baseDir = isPkg
        ? path.dirname(process.execPath)
        : path.resolve(__dirname, '..');

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
        const pems = selfsigned.generate(
            [{ name: 'commonName', value: 'localhost' }],
            {
                days: 365,
                algorithm: 'sha256',
                keySize: 2048,
                extensions: certExtensions,
            },
        );
        fs.writeFileSync(certPath, pems.cert);
        fs.writeFileSync(keyPath, pems.private);
        console.log('SSL created');
    }

    return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
    };
}
