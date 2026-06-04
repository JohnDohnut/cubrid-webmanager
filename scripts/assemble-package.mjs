#!/usr/bin/env node
/**
 * Assembles the final distribution package after build:server + pkg.
 * public/ (frontend static files) is embedded inside the binary via pkg assets.
 *
 * Output: dist/executables/
 *   ├── cwm-linux | cwm.exe | cwm-macos   (public/ embedded)
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
const CONF_SAMPLE = path.join(ROOT, 'cwm.conf.sample');

const PLATFORM_MAP = {
  linux: { src: 'cubrid-web-manager-linux',  dest: 'cubrid-web-manager-linux'  },
  win:   { src: 'cubrid-web-manager.exe',    dest: 'cubrid-web-manager.exe'    },
  mac:   { src: 'cubrid-web-manager-macos',  dest: 'cubrid-web-manager-macos'  },
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

  fs.mkdirSync(EXECUTABLES_DIR, { recursive: true });

  // set executable permission (skip on windows)
  if (platform !== 'win') {
    fs.chmodSync(exeSrc, 0o755);
  }

  // conf/cwm.conf.sample — shared across all platforms
  const confDir = path.join(EXECUTABLES_DIR, 'conf');
  fs.mkdirSync(confDir, { recursive: true });
  if (fs.existsSync(CONF_SAMPLE)) {
    fs.copyFileSync(CONF_SAMPLE, path.join(confDir, 'cwm.conf.sample'));
  }

  console.log(`\n✅ dist/executables/${info.dest}  (public/ embedded inside binary)`);
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
  console.log('\nconf/cwm.conf.sample  ← rename to cwm.conf before first run');
} else {
  assemble(arg);
  console.log('\nconf/cwm.conf.sample  ← rename to cwm.conf before first run');
}
