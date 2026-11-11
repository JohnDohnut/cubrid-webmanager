#!/usr/bin/env node
/**
 * Windows desktop package test, run by .github/workflows/win-test.yml on a
 * Windows runner with the packages of one arch in --packages:
 *
 *   CUBRID-Admin-desktop-<version>-windows-<arch>-setup.exe
 *   CUBRID-Admin-desktop-<version>-windows-<arch>-portable.exe
 *   win-unpacked/ (win-arm64-unpacked/)   electron-builder's unpacked app
 *
 * Three builds are tested, each from a clean state:
 *   installer  the setup.exe installed silently (/S), the installed app driven
 *              with Playwright, then uninstalled silently;
 *   portable   the unpacked app started with PORTABLE_EXECUTABLE_DIR set to a
 *              plain folder, the way the portable.exe stub starts it;
 *   stub       the real portable.exe from a plain folder, reached over its
 *              remote debugging port (the stub is not an Electron process, so
 *              Playwright cannot launch it itself).
 *
 * Checks on the installed and portable builds: first screen is the workspace
 * page (no login), home after it, settings and workspace under the data root,
 * About shows the version, a workspace switch from the settings page survives a
 * restart, the quit question on closing the window (intercepted in the main
 * process and recorded, not rendered), a clean exit. On the stub: first screen,
 * files beside the exe (not in %TEMP% or %APPDATA%), the real quit question
 * answered with Enter.
 *
 * Writes screenshots, app logs and results.json to --out; exits 1 on any failure.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawn } = require('child_process');
const { _electron: electron, chromium } = require('playwright-core');

const argv = process.argv.slice(2);
const option = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  return index === -1 ? fallback : argv[index + 1];
};
const PACKAGES = path.resolve(option('packages', 'packages'));
const ARCH = option('arch', 'x64');
const OUT = path.resolve(option('out', 'out'));
const TEMP = process.env.RUNNER_TEMP || os.tmpdir();
const APPDATA_ROOT = path.join(process.env.APPDATA, 'CUBRID Admin');
const PRODUCT = 'CUBRID Admin';
const EXE_NAME = 'CUBRID Admin.exe';

const results = [];
let shots = 0;

fs.mkdirSync(OUT, { recursive: true });
const LOG = path.join(OUT, 'log.txt');

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG, `${line}\n`);
}

function record(build, check, status, detail = '') {
  results.push({ build, check, status, detail: String(detail ?? '') });
  log(`${status.toUpperCase().padEnd(5)} [${build}] ${check}${detail ? ` -- ${detail}` : ''}`);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const norm = (p) => path.resolve(p).replace(/[\\/]+$/, '').toLowerCase();
const same = (a, b) => norm(a) === norm(b);

/** Runs a check; a throw is a failure with the reason, and the test goes on. */
async function step(build, check, fn) {
  try {
    const detail = await fn();
    record(build, check, 'pass', detail);
    return true;
  } catch (error) {
    const text = error && error.stack ? error.stack.split('\n').slice(0, 2).join(' | ') : String(error);
    record(build, check, 'fail', text);
    return false;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function pwsh(command, timeout = 300000) {
  return execFileSync('pwsh', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', command], {
    encoding: 'utf8',
    timeout,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  }).trim();
}

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

function jsonOf(command) {
  const text = pwsh(command);
  return text ? JSON.parse(text) : null;
}

function versionInfo(file) {
  return jsonOf(`(Get-Item ${q(file)}).VersionInfo | Select-Object FileVersion,ProductVersion,ProductName,CompanyName,FileDescription | ConvertTo-Json -Compress`);
}

function versionFromName(file) {
  const match = /CUBRID-Admin-desktop-(\d+\.\d+\.\d+\.\d+)-windows-/.exec(path.basename(file));
  return match ? match[1] : null;
}

function findPackage(suffix) {
  const name = fs.readdirSync(PACKAGES).find((entry) => entry.endsWith(`-windows-${ARCH}${suffix}`));
  if (!name) throw new Error(`no *-windows-${ARCH}${suffix} in ${PACKAGES}: ${fs.readdirSync(PACKAGES).join(', ')}`);
  return path.join(PACKAGES, name);
}

function listDir(dir, depth = 1) {
  if (!fs.existsSync(dir)) return '(missing)';
  const out = [];
  const walk = (d, level) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      out.push(path.relative(dir, path.join(d, entry.name)) + (entry.isDirectory() ? '\\' : ''));
      if (entry.isDirectory() && level < depth) walk(path.join(d, entry.name), level + 1);
    }
  };
  walk(dir, 1);
  return out.join(', ') || '(empty)';
}

/** Files named `name` under `root`, at most `depth` levels down, not under `skip`. */
function findFiles(root, name, depth, skip = []) {
  const found = [];
  const walk = (dir, level) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (skip.some((s) => norm(full).startsWith(norm(s)))) continue;
      if (entry.isFile() && entry.name.toLowerCase() === name.toLowerCase()) found.push(full);
      else if (entry.isDirectory() && level < depth) walk(full, level + 1);
    }
  };
  walk(root, 1);
  return found;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function appProcessCount() {
  return Number(pwsh(`(Get-Process -Name ${q(PRODUCT)} -ErrorAction SilentlyContinue | Measure-Object).Count`) || 0);
}

function killAppProcesses(why) {
  const count = appProcessCount();
  if (count > 0) {
    log(`killing ${count} "${EXE_NAME}" process(es): ${why}`);
    pwsh(`Get-Process -Name ${q(PRODUCT)} -ErrorAction SilentlyContinue | Stop-Process -Force`);
  }
}

async function screenshot(page, build, name) {
  shots += 1;
  const file = path.join(OUT, build, `${String(shots).padStart(2, '0')}-${name}.png`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  try {
    await page.screenshot({ path: file });
  } catch (error) {
    log(`screenshot ${name} failed: ${error.message}`);
  }
  return path.relative(OUT, file);
}

function screenScreenshot(build, name) {
  shots += 1;
  const file = path.join(OUT, build, `${String(shots).padStart(2, '0')}-${name}.png`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  try {
    pwsh(
      'Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; ' +
        '$b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds; ' +
        '$bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height; ' +
        '$g = [System.Drawing.Graphics]::FromImage($bmp); ' +
        '$g.CopyFromScreen($b.Location, [System.Drawing.Point]::Empty, $b.Size); ' +
        `$bmp.Save(${q(file)}); $g.Dispose(); $bmp.Dispose()`,
      60000
    );
  } catch (error) {
    log(`screen capture ${name} failed: ${error.message}`);
  }
  return path.relative(OUT, file);
}

// ── Playwright helpers ──────────────────────────────────────────────────────

const t = (id) => `[data-testid="${id}"]`;
const HELP_LABELS = ['Help', '도움말'];
const FOLDED_MENU_LABELS = ['Menu', '메뉴'];
const ABOUT_LABELS = ['About CUBRID Admin', 'CUBRID Admin 정보'];
const QUIT_MESSAGES = ['Do you want to quit?', '종료하시겠습니까?'];

async function launchApp(build, exe, env, label) {
  const logFile = path.join(OUT, build, `${label}-app.log`);
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  const app = await electron.launch({
    executablePath: exe,
    args: [],
    env: { ...process.env, ...env },
    timeout: 120000,
  });
  const out = fs.createWriteStream(logFile);
  // Kept here: app.process() cannot be asked once the app has closed.
  const child = app.process();
  app.child = child;
  child.stdout?.on('data', (data) => out.write(data));
  child.stderr?.on('data', (data) => out.write(data));
  app.on('close', () => out.end());
  app.closed = new Promise((resolve) => app.on('close', resolve));
  const page = await app.firstWindow({ timeout: 120000 });
  page.setDefaultTimeout(60000);
  page.on('console', (message) => fs.appendFileSync(logFile, `[renderer ${message.type()}] ${message.text()}\n`));
  page.on('pageerror', (error) => fs.appendFileSync(logFile, `[renderer error] ${error.message}\n`));
  return { app, page };
}

async function visible(page, selector) {
  return page.locator(selector).first().isVisible().catch(() => false);
}

async function clickText(page, labels) {
  for (const label of labels) {
    const locator = page.getByText(label, { exact: true }).first();
    if (await locator.isVisible().catch(() => false)) {
      await locator.click();
      return label;
    }
  }
  throw new Error(`none of ${labels.join(' / ')} is visible`);
}

/** Opens Help > About (or the folded Menu > About on a narrow window) and returns the version shown. */
async function openAbout(page) {
  const folded = page.locator(t('header-menu-folded'));
  if (await folded.count()) {
    const trigger = folded.locator('button, [role="button"]').first();
    if (await trigger.isVisible().catch(() => false)) await trigger.click();
    else await clickText(folded, FOLDED_MENU_LABELS);
  } else {
    await clickText(page, HELP_LABELS);
  }
  await clickText(page, ABOUT_LABELS);
  const version = page.locator(t('about-app-version'));
  await version.waitFor({ state: 'visible' });
  return (await version.textContent()).trim();
}

/** Closes the About modal with its footer button (the X carries the same text, so the last one), else Escape. */
async function closeAbout(page) {
  const version = page.locator(t('about-app-version'));
  const dialog = page.locator('[role="dialog"]').filter({ has: version });
  const button = dialog.getByRole('button', { name: /^(Close|닫기)$/ }).last();
  if (await button.isVisible().catch(() => false)) await button.click();
  else await page.keyboard.press('Escape');
  await version.waitFor({ state: 'detached' });
}

async function closeUpdateNotice(page, build) {
  const notice = page.locator('[data-testid^="update-check-"]').first();
  if (await notice.isVisible().catch(() => false)) {
    const id = await notice.getAttribute('data-testid');
    await screenshot(page, build, 'update-notice');
    for (const button of ['update-check-close', 'update-check-dismiss']) {
      if (await visible(page, t(button))) {
        await page.locator(t(button)).click();
        break;
      }
    }
    record(build, 'startup update notice', 'info', `shown (${id}), closed`);
  }
}

/** Waits for the workspace page or home, whichever comes first. */
async function firstScreen(page) {
  await page.locator(`${t('workspace-setup-title')}, ${t('add-host-toolbar-btn')}, ${t('login-username-input')}`).first().waitFor({ state: 'visible', timeout: 120000 });
  if (await visible(page, t('login-username-input'))) return 'login';
  if (await visible(page, t('workspace-setup-title'))) return 'workspace';
  return 'home';
}

async function waitForHome(page) {
  await page.locator(t('add-host-toolbar-btn')).waitFor({ state: 'visible', timeout: 180000 });
  assert(!(await visible(page, t('login-username-input'))), 'the login page is shown');
}

const bridge = (page, method, ...args) => page.evaluate(([m, a]) => window.desktopBridge[m](...a), [method, args]);

async function patchQuitDialog(app, answer) {
  await app.evaluate(({ dialog }, choice) => {
    global.__cwmQuit = global.__cwmQuit || [];
    dialog.showMessageBoxSync = (_window, options) => {
      global.__cwmQuit.push(options);
      return choice;
    };
  }, answer);
}

const recordedQuestions = (app) => app.evaluate(() => global.__cwmQuit || []);
// The evaluate may lose its target when the close ends the app: that is fine.
const closeMainWindow = (app) => app.evaluate(({ BrowserWindow }) => { BrowserWindow.getAllWindows()[0]?.close(); }).catch(() => undefined);
const windowCount = (app) => app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().length);

async function waitForExit(app, timeout = 60000) {
  const outcome = await Promise.race([app.closed.then(() => 'closed'), sleep(timeout).then(() => 'timeout')]);
  assert(outcome === 'closed', `the app is still running ${timeout / 1000} s after the quit`);
  const child = app.child;
  for (let i = 0; i < 50 && child.exitCode === null; i += 1) await sleep(100);
  return child.exitCode;
}

/**
 * The checks shared by the installed app and the unpacked app run as a
 * portable one. `dataRoot` is where desktop-settings.json and the default
 * workspace are expected.
 */
async function runDesktopChecks({ build, exe, env, dataRoot, expectedVersion }) {
  const workspace1 = path.join(dataRoot, 'cwm-workspace');
  const workspace2 = path.join(TEMP, `cwm-ws2-${build}`);
  fs.rmSync(workspace2, { recursive: true, force: true });
  const settingsFile = path.join(dataRoot, 'desktop-settings.json');
  assert(!fs.existsSync(settingsFile), `${settingsFile} exists before the first run`);

  record(build, 'executable', 'info', `${exe} -- ${JSON.stringify(versionInfo(exe))}`);

  // ── first run ──
  let app;
  let page;
  if (!(await step(build, 'launch (first run)', async () => {
    ({ app, page } = await launchApp(build, exe, env, 'first-run'));
    return `pid ${app.child.pid}`;
  }))) return;

  try {
    await step(build, 'first screen is the workspace page, not the login page', async () => {
      const screen = await firstScreen(page);
      await screenshot(page, build, 'first-screen');
      assert(screen === 'workspace', `first screen is ${screen} (url ${page.url()})`);
      return page.url();
    });

    await step(build, 'workspace page proposes the default workspace under the data root', async () => {
      const value = await page.locator(t('workspace-root-input')).inputValue();
      assert(same(value, workspace1), `proposed "${value}", expected "${workspace1}"`);
      return value;
    });

    await step(build, 'Continue leads to home', async () => {
      await page.locator(t('workspace-continue-btn')).click();
      await waitForHome(page);
      await screenshot(page, build, 'home');
      return page.url();
    });

    await closeUpdateNotice(page, build);

    await step(build, 'settings and workspace are under the data root', async () => {
      assert(fs.existsSync(settingsFile), `${settingsFile} is missing`);
      const settings = readJson(settingsFile);
      assert(settings.workspaceSetupComplete === true, `workspaceSetupComplete is ${settings.workspaceSetupComplete}`);
      for (const dir of ['data', 'ssl']) {
        assert(fs.existsSync(path.join(workspace1, dir)), `${path.join(workspace1, dir)} is missing`);
      }
      assert(fs.existsSync(path.join(workspace1, 'data', 'instance.lock')), 'data\\instance.lock is missing while the app runs');
      const info = await bridge(page, 'getWorkspaceInfo');
      assert(same(info.workspaceRoot, workspace1), `getWorkspaceInfo says ${info.workspaceRoot}`);
      assert(same(info.settingsFilePath, settingsFile), `settingsFilePath is ${info.settingsFilePath}`);
      return `${dataRoot}: ${listDir(dataRoot)}`;
    });

    await step(build, 'About shows the version', async () => {
      const shown = await openAbout(page);
      await screenshot(page, build, 'about');
      const fromBridge = await bridge(page, 'getAppVersion');
      const exeVersion = versionInfo(exe).ProductVersion;
      await closeAbout(page);
      const detail = `About "${shown}", getAppVersion "${fromBridge}", exe ProductVersion "${exeVersion}", package name "${expectedVersion}"`;
      assert(shown === `v${expectedVersion}` || shown === `v${fromBridge}`, detail);
      assert(String(fromBridge) === expectedVersion, detail);
      return detail;
    });

    await step(build, 'workspace switch from the settings page', async () => {
      await page.evaluate(() => { window.location.hash = '#/desktop/workspace'; });
      const input = page.locator(t('workspace-root-input'));
      await input.waitFor({ state: 'visible' });
      await input.fill(workspace2);
      await page.locator(t('workspace-save-btn')).click();
      // The server did not list its jobs: the page asks, go on.
      const ask = page.locator(t('workspace-jobs-unknown-confirm-btn'));
      const asked = await ask.waitFor({ state: 'visible', timeout: 5000 }).then(() => true, () => false);
      if (asked) {
        await screenshot(page, build, 'jobs-unknown-question');
        await ask.click();
      }
      await waitForHome(page);
      await screenshot(page, build, 'home-after-switch');
      const info = await bridge(page, 'getWorkspaceInfo');
      assert(same(info.workspaceRoot, workspace2), `getWorkspaceInfo says ${info.workspaceRoot}`);
      assert(info.isCustomWorkspace === true, 'isCustomWorkspace is not true');
      assert(fs.existsSync(path.join(workspace2, 'data', 'instance.lock')), 'the new workspace has no data\\instance.lock');
      assert(!fs.existsSync(path.join(workspace1, 'data', 'instance.lock')), 'the old workspace still has data\\instance.lock');
      const settings = readJson(settingsFile);
      assert(same(settings.workspaceRoot, workspace2), `desktop-settings.json workspaceRoot is ${settings.workspaceRoot}`);
      return `${workspace2}${asked ? ' (jobs-unknown question answered)' : ''}`;
    });

    await step(build, 'closing the window asks the quit question; Cancel keeps the app', async () => {
      await patchQuitDialog(app, 1);
      await closeMainWindow(app);
      await sleep(1500);
      const questions = await recordedQuestions(app);
      assert(questions.length === 1, `${questions.length} questions recorded`);
      const [question] = questions;
      assert(QUIT_MESSAGES.includes(question.message), `message "${question.message}"`);
      assert(question.type === 'question' && Array.isArray(question.buttons) && question.buttons.length === 2, `options ${JSON.stringify(question)}`);
      assert((await windowCount(app)) === 1, 'the window is gone after Cancel');
      await screenshot(page, build, 'after-quit-cancel');
      return `title "${question.title}", message "${question.message}", buttons ${JSON.stringify(question.buttons)}, default ${question.defaultId}, cancel ${question.cancelId} (intercepted in the main process, not rendered)`;
    });

    await step(build, 'Quit in the question ends the app cleanly', async () => {
      await patchQuitDialog(app, 0);
      await closeMainWindow(app);
      const code = await waitForExit(app);
      await sleep(2000);
      const remaining = appProcessCount();
      assert(code === 0, `exit code ${code}`);
      assert(remaining === 0, `${remaining} "${EXE_NAME}" process(es) still running after quit`);
      assert(!fs.existsSync(path.join(workspace2, 'data', 'instance.lock')), 'data\\instance.lock left after quit');
      return `exit code ${code}, no process left, instance.lock removed`;
    });
  } finally {
    if (app && app.child && app.child.exitCode === null) {
      await app.close().catch(() => undefined);
      await sleep(2000);
      killAppProcesses('cleanup after the first run');
    }
  }

  // ── restart ──
  app = null;
  if (!(await step(build, 'launch (restart)', async () => {
    ({ app, page } = await launchApp(build, exe, env, 'restart'));
    return `pid ${app.child.pid}`;
  }))) return;

  try {
    await step(build, 'restart opens home on the switched workspace, no workspace page', async () => {
      const screen = await firstScreen(page);
      await screenshot(page, build, 'restart-first-screen');
      assert(screen === 'home', `first screen after restart is ${screen}`);
      const info = await bridge(page, 'getWorkspaceInfo');
      assert(same(info.workspaceRoot, workspace2), `getWorkspaceInfo says ${info.workspaceRoot}`);
      return info.workspaceRoot;
    });

    await closeUpdateNotice(page, build);

    await step(build, 'File > Quit (desktopBridge.quitApp) asks and quits', async () => {
      await patchQuitDialog(app, 0);
      await page.evaluate(() => { window.desktopBridge.quitApp(); });
      const code = await waitForExit(app);
      await sleep(2000);
      assert(code === 0, `exit code ${code}`);
      assert(appProcessCount() === 0, `"${EXE_NAME}" process(es) still running after quit`);
      return `exit code ${code}`;
    });
  } finally {
    if (app && app.child && app.child.exitCode === null) {
      await app.close().catch(() => undefined);
      await sleep(2000);
      killAppProcesses('cleanup after the restart');
    }
  }
}

// ── installer ───────────────────────────────────────────────────────────────

function uninstallEntry() {
  const command =
    "$keys = @('HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall', 'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall', 'HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall'); " +
    // electron-builder names the entry "<productName> <version>" (uninstallDisplayName); the server's entry is "CUBRID Admin Server".
    '$found = foreach ($k in $keys) { if (Test-Path $k) { Get-ChildItem $k | ForEach-Object { $p = Get-ItemProperty $_.PSPath; if ($p.DisplayName -like ' +
    q(`${PRODUCT}*`) +
    ' -and $p.DisplayName -notlike ' +
    q(`${PRODUCT} Server*`) +
    ") { [pscustomobject]@{ Hive = $k; Key = $_.PSChildName; DisplayName = $p.DisplayName; DisplayVersion = $p.DisplayVersion; InstallLocation = $p.InstallLocation; UninstallString = $p.UninstallString; DisplayIcon = $p.DisplayIcon; Publisher = $p.Publisher } } } } }; " +
    '@($found) | ConvertTo-Json -Compress';
  const parsed = jsonOf(command);
  const entries = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
  // The install folder: InstallLocation when written, else the folder of the uninstaller or the icon.
  for (const entry of entries) {
    const quoted = (value) => (value ? String(value).replace(/^"/, '').replace(/"(\s.*)?$/, '').trim() : '');
    entry.InstallLocation = entry.InstallLocation || [entry.UninstallString, entry.DisplayIcon].map(quoted).filter((f) => f && /\.exe$/i.test(f)).map((f) => path.dirname(f))[0] || null;
  }
  return entries;
}

function shortcuts() {
  const places = [
    path.join(process.env.USERPROFILE, 'Desktop', `${PRODUCT}.lnk`),
    path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', `${PRODUCT}.lnk`),
    path.join(process.env.PUBLIC || 'C:\\Users\\Public', 'Desktop', `${PRODUCT}.lnk`),
    path.join(process.env.ProgramData || 'C:\\ProgramData', 'Microsoft', 'Windows', 'Start Menu', 'Programs', `${PRODUCT}.lnk`),
  ];
  return places.filter((file) => fs.existsSync(file));
}

async function testInstaller(expectedVersion) {
  const build = 'installer';
  const setup = findPackage('-setup.exe');
  record(build, 'package', 'info', `${path.basename(setup)} (${(fs.statSync(setup).size / 1048576).toFixed(1)} MB) ${JSON.stringify(versionInfo(setup))}`);
  if (fs.existsSync(APPDATA_ROOT)) {
    record(build, 'clean state', 'info', `${APPDATA_ROOT} existed before the test: ${listDir(APPDATA_ROOT)}; removed`);
    fs.rmSync(APPDATA_ROOT, { recursive: true, force: true });
  }

  let entry = null;
  const installed = await step(build, 'silent install (/S)', async () => {
    const code = pwsh(`$p = Start-Process -FilePath ${q(setup)} -ArgumentList '/S' -Wait -PassThru; $p.ExitCode`);
    assert(code === '0', `installer exit code ${code}`);
    // The installer may hand over to an elevated copy of itself: wait for the entry.
    let entries = [];
    let waited = 0;
    for (; waited < 180 && entries.length === 0; waited += 5) {
      entries = uninstallEntry();
      if (entries.length === 0) await sleep(5000);
    }
    const setupProcesses = pwsh(`(Get-Process | Where-Object { $_.Path -eq ${q(setup)} } | Measure-Object).Count`);
    assert(entries.length === 1, `${entries.length} uninstall entries for "${PRODUCT}" after ${waited} s (${setupProcesses} installer process(es) still running): ${JSON.stringify(entries)}`);
    [entry] = entries;
    assert(entry.InstallLocation, `no install folder in the uninstall entry: ${JSON.stringify(entry)}`);
    assert(fs.existsSync(path.join(entry.InstallLocation, EXE_NAME)), `${EXE_NAME} is not in ${entry.InstallLocation} (entry ${JSON.stringify(entry)})`);
    const mode = entry.Hive.startsWith('HKCU') ? 'per user' : 'per machine';
    const links = shortcuts();
    return `${mode}, ${entry.InstallLocation}, "${entry.DisplayName}" DisplayVersion ${entry.DisplayVersion}, registered after ${waited} s, shortcuts: ${links.join('; ') || 'none'}`;
  });
  if (!installed) return;

  const exe = path.join(entry.InstallLocation, EXE_NAME);
  await step(build, 'installed executable carries the version', async () => {
    const info = versionInfo(exe);
    assert(info.ProductVersion === expectedVersion, `ProductVersion ${info.ProductVersion}, expected ${expectedVersion}`);
    assert(String(entry.DisplayVersion).startsWith(expectedVersion.split('.').slice(0, 3).join('.')), `DisplayVersion ${entry.DisplayVersion}`);
    return JSON.stringify(info);
  });

  await step(build, 'shortcuts on the desktop and in the start menu', async () => {
    const links = shortcuts();
    assert(links.some((f) => f.includes('\\Desktop\\')), 'no desktop shortcut');
    assert(links.some((f) => f.includes('Start Menu')), 'no start menu shortcut');
    return links.join('; ');
  });

  await runDesktopChecks({ build, exe, env: {}, dataRoot: APPDATA_ROOT, expectedVersion });

  await step(build, 'silent uninstall (/S)', async () => {
    killAppProcesses('before the uninstall');
    const uninstaller = path.join(entry.InstallLocation, `Uninstall ${PRODUCT}.exe`);
    assert(fs.existsSync(uninstaller), `${uninstaller} is missing`);
    const mode = entry.Hive.startsWith('HKCU') ? '/currentuser' : '/allusers';
    const code = pwsh(`$p = Start-Process -FilePath ${q(uninstaller)} -ArgumentList '/S', '${mode}' -Wait -PassThru; $p.ExitCode`);
    assert(code === '0', `uninstaller exit code ${code}`);
    // The uninstaller runs on from a copy of itself: wait for the folder to go.
    for (let i = 0; i < 60 && fs.existsSync(entry.InstallLocation); i += 1) await sleep(2000);
    return `exit code ${code}`;
  });

  await step(build, 'what the uninstall leaves', async () => {
    const left = [];
    if (fs.existsSync(entry.InstallLocation)) left.push(`install folder ${entry.InstallLocation}: ${listDir(entry.InstallLocation)}`);
    const links = shortcuts();
    if (links.length) left.push(`shortcuts: ${links.join('; ')}`);
    const entries = uninstallEntry();
    if (entries.length) left.push(`uninstall entry: ${JSON.stringify(entries)}`);
    const appData = fs.existsSync(APPDATA_ROOT) ? `${APPDATA_ROOT}: ${listDir(APPDATA_ROOT)}` : `${APPDATA_ROOT}: removed`;
    assert(!fs.existsSync(entry.InstallLocation), left.join(' | '));
    assert(links.length === 0 && entries.length === 0, left.join(' | '));
    return `program, shortcuts and uninstall entry removed; ${appData}`;
  });

  // The next build starts clean: the settings the installed app kept are removed here, by the test.
  if (fs.existsSync(APPDATA_ROOT)) {
    record(build, 'cleanup', 'info', `${APPDATA_ROOT} removed by the test after the uninstall (it keeps desktop-settings.json and cwm-workspace, as expected)`);
    fs.rmSync(APPDATA_ROOT, { recursive: true, force: true });
  }
}

// ── portable (unpacked app with PORTABLE_EXECUTABLE_DIR) ────────────────────

async function testPortableUnpacked(expectedVersion) {
  const build = 'portable';
  const unpacked = path.join(PACKAGES, ARCH === 'arm64' ? 'win-arm64-unpacked' : 'win-unpacked');
  const exe = path.join(unpacked, EXE_NAME);
  if (!fs.existsSync(exe)) {
    record(build, 'package', 'fail', `${exe} is missing: ${listDir(PACKAGES)}`);
    return;
  }
  const home = path.join(TEMP, 'cwm-portable-home');
  fs.rmSync(home, { recursive: true, force: true });
  fs.mkdirSync(home, { recursive: true });
  record(build, 'package', 'info', `${exe} started with PORTABLE_EXECUTABLE_DIR=${home} (what the portable.exe stub sets)`);

  await runDesktopChecks({ build, exe, env: { PORTABLE_EXECUTABLE_DIR: home }, dataRoot: home, expectedVersion });

  await step(build, 'nothing of the portable app in %APPDATA%\\CUBRID Admin or %TEMP%', async () => {
    const inAppData = fs.existsSync(path.join(APPDATA_ROOT, 'desktop-settings.json')) || fs.existsSync(path.join(APPDATA_ROOT, 'cwm-workspace'));
    assert(!inAppData, `${APPDATA_ROOT} holds desktop-settings.json or cwm-workspace: ${listDir(APPDATA_ROOT)}`);
    const stray = findFiles(os.tmpdir(), 'desktop-settings.json', 4, [home]);
    assert(stray.length === 0, `desktop-settings.json found in a temp folder: ${stray.join('; ')}`);
    const profile = fs.existsSync(APPDATA_ROOT) ? ` (${APPDATA_ROOT} holds only Chromium's own profile files: ${listDir(APPDATA_ROOT)})` : '';
    return `settings and workspace only in ${home}${profile}`;
  });
}

// ── the real portable.exe stub ──────────────────────────────────────────────

async function testPortableStub(expectedVersion) {
  const build = 'stub';
  const portable = findPackage('-portable.exe');
  record(build, 'package', 'info', `${path.basename(portable)} (${(fs.statSync(portable).size / 1048576).toFixed(1)} MB) ${JSON.stringify(versionInfo(portable))}`);
  const folder = path.join(TEMP, 'cwm-portable-stub');
  fs.rmSync(folder, { recursive: true, force: true });
  fs.mkdirSync(folder, { recursive: true });
  const exe = path.join(folder, path.basename(portable));
  fs.copyFileSync(portable, exe);
  if (fs.existsSync(APPDATA_ROOT)) fs.rmSync(APPDATA_ROOT, { recursive: true, force: true });

  const port = 9333;
  const logFile = path.join(OUT, build, 'stub-app.log');
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  const fd = fs.openSync(logFile, 'a');
  const child = spawn(exe, [`--remote-debugging-port=${port}`], { cwd: folder, stdio: ['ignore', fd, fd], windowsHide: false });
  let exitCode = null;
  const exited = new Promise((resolve) => child.on('exit', (code) => { exitCode = code; resolve(code); }));
  const killTree = (why) => {
    if (exitCode === null) {
      log(`killing the stub process tree (pid ${child.pid}): ${why}`);
      try {
        execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      } catch {
        // already gone
      }
      killAppProcesses(why);
    }
  };

  let browser = null;
  let page = null;
  try {
    await step(build, 'portable.exe starts from a plain folder and opens its window', async () => {
      let ready = false;
      for (let i = 0; i < 150 && exitCode === null && !ready; i += 1) {
        try {
          const response = await fetch(`http://127.0.0.1:${port}/json/version`);
          ready = response.ok;
        } catch {
          // not listening yet
        }
        if (!ready) await sleep(1000);
      }
      assert(exitCode === null, `the stub exited with ${exitCode} before its window came up`);
      assert(ready, 'no remote debugging port after 150 s');
      browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, { timeout: 60000 });
      for (let i = 0; i < 60 && !page; i += 1) {
        page = browser.contexts().flatMap((context) => context.pages()).find((p) => p.url().startsWith('app://'));
        if (!page) await sleep(1000);
      }
      assert(page, `no app:// page over CDP (pages: ${browser.contexts().flatMap((c) => c.pages()).map((p) => p.url()).join(', ')})`);
      page.setDefaultTimeout(60000);
      return `pid ${child.pid}, ${page.url()}`;
    });
    if (!page) return;

    await step(build, 'first screen is the workspace page, not the login page', async () => {
      const screen = await firstScreen(page);
      await screenshot(page, build, 'first-screen');
      assert(screen === 'workspace', `first screen is ${screen}`);
      return page.url();
    });

    await step(build, 'settings file and default workspace are beside the exe', async () => {
      const info = await bridge(page, 'getWorkspaceInfo');
      assert(same(info.settingsFilePath, path.join(folder, 'desktop-settings.json')), `settingsFilePath is ${info.settingsFilePath}`);
      assert(same(info.defaultWorkspaceRoot, path.join(folder, 'cwm-workspace')), `defaultWorkspaceRoot is ${info.defaultWorkspaceRoot}`);
      return `${info.settingsFilePath}; ${info.defaultWorkspaceRoot}`;
    });

    await step(build, 'Continue leads to home, files land beside the exe', async () => {
      await page.locator(t('workspace-continue-btn')).click();
      await waitForHome(page);
      await screenshot(page, build, 'home');
      assert(fs.existsSync(path.join(folder, 'desktop-settings.json')), 'desktop-settings.json is not beside the exe');
      assert(fs.existsSync(path.join(folder, 'cwm-workspace', 'data')), 'cwm-workspace\\data is not beside the exe');
      const stray = findFiles(os.tmpdir(), 'desktop-settings.json', 4, [folder]);
      assert(stray.length === 0, `desktop-settings.json in a temp folder: ${stray.join('; ')}`);
      assert(!fs.existsSync(path.join(APPDATA_ROOT, 'desktop-settings.json')), `desktop-settings.json in ${APPDATA_ROOT}`);
      return `${folder}: ${listDir(folder)}`;
    });

    await closeUpdateNotice(page, build);

    await step(build, 'About shows the version', async () => {
      const shown = await openAbout(page);
      await screenshot(page, build, 'about');
      await closeAbout(page);
      assert(shown === `v${expectedVersion}`, `About "${shown}", package name "${expectedVersion}"`);
      return shown;
    });

    // The real quit question: ask through the header menu's Quit, then answer
    // it with Enter (its default button is Quit) from outside the app.
    await step(build, 'real quit question on quit, answered with Enter, app exits', async () => {
      // The modal question blocks the main process, and with it every answer
      // over CDP: fire the quit, do not wait on it, and drop the connection.
      await Promise.race([page.evaluate(() => { window.desktopBridge.quitApp(); }).catch(() => undefined), sleep(3000)]);
      const connection = browser;
      browser = null;
      void connection.close().catch(() => undefined);
      await sleep(3000);
      assert(exitCode === null, `the app exited (${exitCode}) without asking`);
      const shot = screenScreenshot(build, 'quit-question-screen');
      pwsh(
        'Add-Type -AssemblyName System.Windows.Forms; $shell = New-Object -ComObject WScript.Shell; ' +
          `$null = $shell.AppActivate(${q(PRODUCT)}); Start-Sleep -Milliseconds 500; [System.Windows.Forms.SendKeys]::SendWait('{ENTER}')`,
        60000
      );
      const code = await Promise.race([exited, sleep(30000).then(() => 'timeout')]);
      assert(code !== 'timeout', 'the app is still running 30 s after Enter in the quit question');
      await sleep(2000);
      assert(code === 0, `exit code ${code}`);
      assert(appProcessCount() === 0, `"${EXE_NAME}" process(es) left`);
      return `exit code ${code}; screen capture ${shot}`;
    });
  } finally {
    if (browser) await Promise.race([browser.close().catch(() => undefined), sleep(5000)]);
    killTree('cleanup');
    fs.closeSync(fd);
  }
}

// ── main ────────────────────────────────────────────────────────────────────

async function main() {
  log(`packages ${PACKAGES} (${ARCH}), out ${OUT}, runner ${os.hostname()} ${os.release()} ${process.arch}, node ${process.version}`);
  record('runner', 'packages', 'info', listDir(PACKAGES));
  const setup = findPackage('-setup.exe');
  const expectedVersion = versionFromName(setup);
  assert(expectedVersion, `no version in ${path.basename(setup)}`);
  record('runner', 'version from the package name', 'info', expectedVersion);
  if (appProcessCount() > 0) killAppProcesses('left from before the test');

  for (const [name, fn] of [
    ['installer', testInstaller],
    ['portable', testPortableUnpacked],
    ['stub', testPortableStub],
  ]) {
    try {
      await fn(expectedVersion);
    } catch (error) {
      record(name, 'test run', 'fail', error && error.stack ? error.stack.split('\n').slice(0, 3).join(' | ') : String(error));
    }
    killAppProcesses(`after the ${name} build`);
  }
}

function report() {
  const failed = results.filter((r) => r.status === 'fail');
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ arch: ARCH, results }, null, 2));
  const rows = results.map((r) => `| ${r.build} | ${r.check} | ${r.status} | ${r.detail.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')} |`);
  const table = [`### Desktop ${ARCH}: ${failed.length} failed, ${results.filter((r) => r.status === 'pass').length} passed`, '', '| build | check | status | detail |', '|---|---|---|---|', ...rows, ''].join('\n');
  fs.writeFileSync(path.join(OUT, 'results.md'), table);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, table);
  console.log(table);
  return failed.length;
}

main()
  .then(() => process.exit(report() > 0 ? 1 : 0))
  .catch((error) => {
    record('runner', 'test run', 'fail', error && error.stack ? error.stack : String(error));
    process.exit(report() > 0 ? 1 : 0);
  });
