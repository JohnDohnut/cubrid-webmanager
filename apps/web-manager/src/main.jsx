import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import AppRouter from './app/AppRouter'
import { store } from './app/store'
import './styles/index.css'
import App from './app/App'

import { ToastProvider } from './infrastructure/context/ToastContext'
import { ConfirmProvider } from './infrastructure/context/ConfirmContext'
import { ErrorBoundary } from './infrastructure/ErrorBoundary'
import { registerDesktopExitAuthReset } from './app/registerDesktopExitAuthReset'

registerDesktopExitAuthReset()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <ConfirmProvider>
          <AppRouter>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </AppRouter>
        </ConfirmProvider>
      </ToastProvider>
    </Provider>
  </StrictMode>,
)
