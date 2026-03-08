#!/usr/bin/env node

/**
 * 간단한 정적 파일 서버
 * web-manager 빌드 결과물을 서빙합니다.
 * 
 * 사용법:
 *   node serve-web-manager.js [포트번호]
 *   예: node serve-web-manager.js 4200
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] ? parseInt(process.argv[2], 10) : 4200;
const BUILD_DIR = path.join(__dirname, '..', 'dist', 'apps', 'web-manager');

// MIME 타입 매핑
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const mimeType = getMimeType(filePath);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // CORS 헤더 추가 (필요한 경우)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // URL 정규화
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = filePath.split('?')[0]; // 쿼리 문자열 제거
  
  // 실제 파일 경로
  const fullPath = path.join(BUILD_DIR, filePath);

  // 보안: BUILD_DIR 밖으로 나가는 경로 차단
  if (!fullPath.startsWith(BUILD_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 파일이 없으면 index.html로 fallback (SPA 라우팅 지원)
      const indexPath = path.join(BUILD_DIR, 'index.html');
      serveFile(indexPath, res);
      return;
    }

    serveFile(fullPath, res);
  });
});

// 빌드 디렉토리 확인
if (!fs.existsSync(BUILD_DIR)) {
  console.error(`❌ 빌드 디렉토리를 찾을 수 없습니다: ${BUILD_DIR}`);
  console.error('먼저 다음 명령어로 빌드하세요:');
  console.error('  nx build web-manager');
  process.exit(1);
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Web Manager 서버가 시작되었습니다!`);
  console.log(`📁 서빙 디렉토리: ${BUILD_DIR}`);
  console.log(`🌐 접속 주소: http://localhost:${PORT}`);
  console.log(`   또는: http://0.0.0.0:${PORT}`);
  console.log(`\n종료하려면 Ctrl+C를 누르세요.`);
});

// 에러 처리
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 포트 ${PORT}가 이미 사용 중입니다.`);
    console.error(`다른 포트를 사용하세요: node serve-web-manager.js [포트번호]`);
  } else {
    console.error('❌ 서버 오류:', err);
  }
  process.exit(1);
});
