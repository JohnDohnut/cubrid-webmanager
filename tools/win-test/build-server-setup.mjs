#!/usr/bin/env node
/**
 * Fallback for the Windows server setup.exe when scripts/package-server-installers.mjs
 * fails on the build host: the same NSIS script (packaging/server/windows/installer.nsi),
 * the same files and defines, built with makensis (electron-builder's downloaded
 * one when it is in its cache, else the one on PATH or the NSIS install folder).
 * The output is written where the product script writes it:
 * dist/server-installers/CUBRID-Admin-server-<version>-windows-x64-setup.exe.
 *
 * Run from the repository root after the server executable is built.
 */
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';

const ROOT = process.cwd();
const require = createRequire(path.join(ROOT, 'package.json'));
const { productVersion } = require('./scripts/product-version.cjs');

const EXECUTABLES = path.join(ROOT, 'dist', 'executables');
const OUT = path.join(ROOT, 'dist', 'server-installers');
const WORK = path.join(OUT, '.work-fallback');
const PACKAGING = path.join(ROOT, 'packaging', 'server', 'windows');

const WINSW = {
  url: 'https://github.com/winsw/winsw/releases/download/v2.12.0/WinSW-x64.exe',
  sha256: '05b82d46ad331cc16bdc00de5c6332c1ef818df8ceefcd49c726553209b3a0da',
  cache: path.join(ROOT, 'node_modules', '.cache', 'winsw', 'WinSW-x64-2.12.0.exe'),
};

const sha256 = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function winswExecutable() {
  if (!fs.existsSync(WINSW.cache) || sha256(WINSW.cache) !== WINSW.sha256) {
    const response = await fetch(WINSW.url);
    if (!response.ok) throw new Error(`Cannot download WinSW: HTTP ${response.status} ${WINSW.url}`);
    fs.mkdirSync(path.dirname(WINSW.cache), { recursive: true });
    fs.writeFileSync(WINSW.cache, Buffer.from(await response.arrayBuffer()));
  }
  const actual = sha256(WINSW.cache);
  if (actual !== WINSW.sha256) throw new Error(`WinSW checksum mismatch: expected ${WINSW.sha256}, got ${actual}`);
  return WINSW.cache;
}

/** makensis: electron-builder's cached NSIS (same version as the desktop setup), else PATH, else the NSIS install folder. */
function findMakensis() {
  const cacheRoots = [
    process.env.ELECTRON_BUILDER_CACHE,
    process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA ?? '', 'electron-builder', 'Cache') : path.join(os.homedir(), 'Library', 'Caches', 'electron-builder'),
  ].filter(Boolean);
  for (const root of cacheRoots) {
    const nsisDir = path.join(root, 'nsis');
    if (!fs.existsSync(nsisDir)) continue;
    for (const entry of fs.readdirSync(nsisDir).sort().reverse()) {
      const bundle = path.join(nsisDir, entry);
      const candidates = process.platform === 'win32'
        ? [path.join(bundle, 'Bin', 'makensis.exe'), path.join(bundle, 'makensis.exe')]
        : [path.join(bundle, process.platform === 'darwin' ? 'mac' : 'linux', 'makensis')];
      const binary = candidates.find((file) => fs.existsSync(file));
      if (binary) return { binary, env: { ...process.env, NSISDIR: bundle }, from: `electron-builder cache ${entry}` };
    }
  }
  for (const binary of ['makensis', path.join(process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)', 'NSIS', 'makensis.exe')]) {
    try {
      execFileSync(binary, ['-VERSION'], { stdio: 'ignore' });
      return { binary, env: process.env, from: binary === 'makensis' ? 'PATH' : binary };
    } catch {
      // not there
    }
  }
  throw new Error('makensis not found (electron-builder cache, PATH, NSIS install folder)');
}

const exe = path.join(EXECUTABLES, 'cubrid-admin.exe');
if (!fs.existsSync(exe)) {
  console.error(`${exe} is missing: build the server executable first.`);
  process.exit(1);
}
const { version } = productVersion();
fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(WORK, { recursive: true });
fs.copyFileSync(exe, path.join(WORK, 'cubrid-admin.exe'));
fs.copyFileSync(await winswExecutable(), path.join(WORK, 'cubrid-admin-service.exe'));
fs.copyFileSync(path.join(PACKAGING, 'cubrid-admin-service.xml'), path.join(WORK, 'cubrid-admin-service.xml'));
fs.copyFileSync(path.join(ROOT, 'cwm.conf.sample'), path.join(WORK, 'cwm.conf.sample'));
fs.copyFileSync(path.join(ROOT, 'cwm.conf.reference.md'), path.join(WORK, 'cwm.conf.reference.md'));

const file = `CUBRID-Admin-server-${version}-windows-x64-setup.exe`;
const numeric = version.split('.').map(Number).join('.');
const makensis = findMakensis();
console.log(`makensis from ${makensis.from}: ${makensis.binary}`);
fs.mkdirSync(OUT, { recursive: true });
execFileSync(
  makensis.binary,
  [
    '-V2',
    `-DVERSION=${version}`,
    `-DVERSION4=${numeric}`,
    `-DYEAR=${new Date().getFullYear()}`,
    `-DSRCDIR=${WORK}`,
    `-DOUTFILE=${path.join(OUT, file)}`,
    path.join(PACKAGING, 'installer.nsi'),
  ],
  { stdio: 'inherit', env: makensis.env }
);
fs.rmSync(WORK, { recursive: true, force: true });
console.log(`dist/server-installers/${file} (built by tools/win-test/build-server-setup.mjs, not by scripts/package-server-installers.mjs)`);
