#!/usr/bin/env node
/**
 * Assembles the final distribution package after build:server + pkg.
 *
 * Output: dist/executables/{platform}/
 *   ├── cwm-linux | cwm.exe | cwm-macos
 *   ├── public/
 *   └── conf/
 *       └── cwm.conf.sample   (rename to cwm.conf before first run)
 *
 * Usage: node scripts/assemble-package.mjs <linux|win|mac|all>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const EXECUTABLES_DIR = path.join(ROOT, 'dist', 'executables');
const PUBLIC_SRC = path.join(ROOT, 'dist', 'apps', 'api-server', 'public');
const CONF_SAMPLE = path.join(ROOT, 'cwm.conf.sample');

const PLATFORM_MAP = {
  linux: { src: 'api-server-linux',  dest: 'cwm-linux'  },
  win:   { src: 'api-server.exe',    dest: 'cwm.exe'    },
  mac:   { src: 'api-server-macos',  dest: 'cwm-macos'  },
};

function assemble(platform) {
  const info = PLATFORM_MAP[platform];
  if (!info) {
    console.error(`Unknown platform: ${platform}. Use linux | win | mac | all`);
    process.exit(1);
  }

  const exeSrc = path.join(EXECUTABLES_DIR, info.src);
  if (!fs.existsSync(exeSrc)) {
    console.error(`Executable not found: ${exeSrc}`);
    console.error(`Run pkg build first.`);
    process.exit(1);
  }

  const outDir = path.join(EXECUTABLES_DIR, platform);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  // executable
  const exeDest = path.join(outDir, info.dest);
  fs.copyFileSync(exeSrc, exeDest);
  if (platform !== 'win') {
    fs.chmodSync(exeDest, 0o755);
  }

  // public/
  if (!fs.existsSync(PUBLIC_SRC)) {
    console.error(`public/ not found: ${PUBLIC_SRC}`);
    console.error(`Run npm run build:server first.`);
    process.exit(1);
  }
  fs.cpSync(PUBLIC_SRC, path.join(outDir, 'public'), { recursive: true });

  // conf/cwm.conf.sample
  const confDir = path.join(outDir, 'conf');
  fs.mkdirSync(confDir, { recursive: true });
  if (fs.existsSync(CONF_SAMPLE)) {
    fs.copyFileSync(CONF_SAMPLE, path.join(confDir, 'cwm.conf.sample'));
  }

  console.log(`\n✅ Package assembled: ${outDir}`);
  console.log(`   ${info.dest}`);
  console.log(`   public/`);
  console.log(`   conf/cwm.conf.sample  ← rename to cwm.conf before first run`);
}

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node scripts/assemble-package.mjs <linux|win|mac|all>');
  process.exit(1);
}

if (arg === 'all') {
  for (const platform of Object.keys(PLATFORM_MAP)) {
    assemble(platform);
  }
} else {
  assemble(arg);
}
