import { useEffect } from 'react';
import { useSelector, useStore } from 'react-redux';
import { acquireStatdumpWatcher, restartFrozenStatdumpWatcher, setStatdumpWatcherPaused } from './statdumpWatcher';
import { isDbReadable } from './dbReadable';
import { useAnyModalOpen } from '../../infrastructure/hooks/useAnyModalOpen';
import { useLatestRef } from '../../infrastructure/hooks/useLatestRef';

/**
 * Keeps a statdump watcher attached to host+db while the calling dashboard
 * is mounted (DB dashboard tabs stay mounted while hidden, so this spans the
 * tab's lifetime), and restarts it when the performance counters stopped
 * moving. See statdumpWatcher.js.
 *
 * Only while the database is logged in: the watcher is a per-db request the
 * server refuses without a DB login, so a logout (or an expired login)
 * releases it. Its periodic start pauses as the dashboard's own polling
 * does: while the host waits in the reconnect window, and while a modal
 * covers the screen.
 *
 * @param {object|undefined} perfSample the dashboard entry's statdump sample
 */
export function useStatdumpWatcher(hostUid, dbname, perfSample) {
  const isAuthorized = useSelector((state) => Boolean(hostUid) && state.host.authorizedHosts.includes(hostUid));
  const store = useStore();
  // Not while its logout runs either (isDbReadable).
  const isLoggedIn = useSelector((state) => isDbReadable(state, hostUid, dbname));
  const isPendingReconnect = useSelector((state) => Boolean(hostUid) && (state.host.reconnectQueue ?? []).includes(hostUid));
  const anyModalOpen = useAnyModalOpen();
  const canWatch = isAuthorized && isLoggedIn;
  const paused = isPendingReconnect || anyModalOpen;
  // Read at acquire time only; later changes go through the effect below.
  const pausedRef = useLatestRef(paused);

  useEffect(() => {
    if (!canWatch) return undefined;
    const release = acquireStatdumpWatcher(hostUid, dbname, undefined, { paused: pausedRef.current });
    // Released for a logout: no stop the server would refuse. Read from the
    // store, as this runs before the render's own values reach any ref.
    return () => release({ loginGone: !isDbReadable(store.getState(), hostUid, dbname) });
  }, [canWatch, hostUid, dbname, pausedRef, store]);

  useEffect(() => {
    if (!canWatch) return;
    setStatdumpWatcherPaused(hostUid, dbname, paused);
  }, [canWatch, hostUid, dbname, paused]);

  const sampleTime = perfSample?.time;
  const unchangedSince = perfSample?.unchangedSince;
  useEffect(() => {
    if (!canWatch || !sampleTime) return;
    restartFrozenStatdumpWatcher(hostUid, dbname, unchangedSince, sampleTime);
  }, [canWatch, hostUid, dbname, sampleTime, unchangedSince]);
}
