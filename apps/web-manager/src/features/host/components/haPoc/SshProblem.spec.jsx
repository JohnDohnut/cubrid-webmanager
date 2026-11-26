import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  window.matchMedia ??= () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined });
});
const mocks = vi.hoisted(() => ({ check: vi.fn() }));
vi.mock('../../../../api/apiClient', () => ({ default: { defaults: { headers: { common: {} } } } }));
vi.mock('../../hostApi', () => ({ hostApi: { haAddNodesCheck: mocks.check } }));
import SshTargetCard from './SshTargetCard';
import { CM } from '../../../../constants/cmLabels';

let container;
let root;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

const W = CM.haAddSlave;
const node = (check) => ({ id: 1, ssh: { host: 'haxs1', sshPort: '22', osUser: 'cubrid', osPassword: 'pw' }, check, accepted: false });
const store = configureStore({ reducer: { user: () => ({ preferences: { uiLocale: 'en' } }) } });
const L = CM.haSlavePoc;
const labels = { host: W.newNodeHost, sshPort: L.sshPort, osUser: L.osUser, osPassword: L.osPassword, acceptFingerprint: W.acceptNodeFingerprint };
const render = (check) => act(async () => root.render(
  <Provider store={store}>
    <SshTargetCard hostUid="h1" node={node(check)} onChange={() => {}} L={L} labels={labels} causes={W.sshCauses} sshLabels={W.sshLabels} />
  </Provider>
));
const problem = () => container.querySelector('[data-testid="ha-ssh-problem"]');

it('names the node, the cause and what to do for a failed check, not just "failed"', async () => {
  await render({ result: 'no_password_auth', message: 'publickey only' });
  expect(problem().textContent).toBe('haxs1 · Cause: Password login is offTo do: Turn PasswordAuthentication on in the node\'s sshd settingsDetail: publickey only');
});

it('takes CMS\'s own action line, and shows an unknown code as it is', async () => {
  await render({ result: 'brand_new_code', message: 'x', error_action: 'do this' });
  expect(problem().textContent).toBe('haxs1 · Cause: brand_new_codeTo do: do thisDetail: x');
});

it('shows no problem for the first round or a good check', async () => {
  await render({ result: 'hostkey_unknown', hostkey_sha256: 'SHA256:k' });
  expect(problem()).toBeNull();
  await render({ result: 'ok', hostkey_sha256: 'SHA256:k' });
  expect(problem()).toBeNull();
});

it('says a different CUBRID version per node', async () => {
  await render({ result: 'version_mismatch', message: '11.4.5 vs 11.4.4' });
  expect(problem().textContent).toContain('The CUBRID version differs from this server\'s');
});
