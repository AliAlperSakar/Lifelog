import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './app/ThemeProvider'
import { QuickLogProvider } from './app/QuickLogContext'
import { ensureDatabaseReady } from './db/bootstrap'

void ensureDatabaseReady()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider>
        <QuickLogProvider>
          <App />
        </QuickLogProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>,
)
