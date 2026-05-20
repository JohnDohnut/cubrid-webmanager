import { BrowserRouter, HashRouter } from 'react-router-dom';

function useHashRouter() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.location.protocol === 'app:' || Boolean(window.desktopConfig?.isDesktop);
}

export default function AppRouter({ children }) {
  const Router = useHashRouter() ? HashRouter : BrowserRouter;
  return <Router>{children}</Router>;
}
