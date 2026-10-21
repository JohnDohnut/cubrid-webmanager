import React, { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';

vi.mock('../../broker/brokerApi', () => ({
  brokerApi: { getBrokerConfig: vi.fn(), updateBrokerConfig: vi.fn() },
}));
vi.mock('../../layout/layoutSlice', () => ({
  setTabDirty: payload => ({ type: 'dirty', payload }),
  showStatusModal: payload => ({ type: 'status', payload }),
}));
import { brokerApi } from '../../broker/brokerApi';
import BrokerConfigEditor from './BrokerConfigEditor';

// Minimal fixture, not the full real schema — just enough to exercise the
// numeric-guard + jump-to-line path (MIN_NUM_APPL_SERVER's real guard/
// default, per broker-param-schema.ts).
const BROKER_PARAM_SCHEMA = [
  { key: 'MIN_NUM_APPL_SERVER', category: 'common', guard: { kind: 'int', min: 1 }, default: '5' },
];

const config = lines => ({ conflist: [{ confdata: lines.split('\n') }] });
let container;
let root;
let store;
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.resetAllMocks();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  store = configureStore({
    reducer: (current = {
      host: { hosts: [], hostEnvs: { host: { paramSchemas: { broker: BROKER_PARAM_SCHEMA } } } },
      layout: { refreshCounter: 0, refreshTabId: null },
      lastStatus: null,
    }, action) => (action.type === 'status' ? { ...current, lastStatus: action.payload } : current),
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});
const render = async () => act(async () => {
  root.render(<StrictMode><Provider store={store}><BrokerConfigEditor hostUid="host" /></Provider></StrictMode>);
});
const element = id => container.querySelector(`[data-testid="broker-config-${id}"]`);

// Simulates the user actually typing into the textarea (plain `.value =`
// doesn't go through React's change-event plumbing) — Save stays disabled
// (hasChanges === false) until something edits the content this way.
const editTextarea = (next) => {
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(element('textarea'), next);
  element('textarea').dispatchEvent(new Event('input', { bubbles: true }));
};

it('blocks saving a non-numeric value for an int-guarded param and jumps the editor to its line', async () => {
  brokerApi.getBrokerConfig.mockResolvedValue(config('SERVICE=ON\nMIN_NUM_APPL_SERVER=5'));
  await render();
  await act(async () => editTextarea('SERVICE=ON\nMIN_NUM_APPL_SERVER=abc'));
  expect(element('save-btn').disabled).toBe(false);

  await act(async () => element('save-btn').click());

  // Rejected before ever reaching the save API — the numeric guard caught it.
  expect(brokerApi.updateBrokerConfig).not.toHaveBeenCalled();
  // Jumped to (selected) line 2, where the bad value actually is.
  const textarea = element('textarea');
  expect(textarea.selectionStart).toBe('SERVICE=ON\n'.length);
  expect(textarea.selectionEnd).toBe('SERVICE=ON\nMIN_NUM_APPL_SERVER=abc'.length);
});

it('saves a valid numeric value and warns that a broker restart is required', async () => {
  brokerApi.getBrokerConfig.mockResolvedValue(config('SERVICE=ON\nMIN_NUM_APPL_SERVER=5'));
  brokerApi.updateBrokerConfig.mockResolvedValue({});
  await render();
  await act(async () => editTextarea('SERVICE=ON\nMIN_NUM_APPL_SERVER=10'));

  await act(async () => element('save-btn').click());

  expect(brokerApi.updateBrokerConfig).toHaveBeenCalledWith('host', ['SERVICE=ON', 'MIN_NUM_APPL_SERVER=10']);
  expect(store.getState().lastStatus.type).toBe('success');
  expect(store.getState().lastStatus.guidance).toContain(
    'The broker must be restarted for this change to take effect.'
  );
});
