export function registerDesktopExitAuthReset() {
  if (typeof window === 'undefined' || !window.desktopConfig?.clearAuthOnExit) {
    return;
  }

  const clearAuthToken = () => {
    localStorage.removeItem('token');
  };

  window.addEventListener('pagehide', clearAuthToken);
  window.addEventListener('beforeunload', clearAuthToken);
}
