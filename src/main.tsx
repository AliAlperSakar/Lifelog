import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './app/ThemeProvider'
import { QuickLogProvider } from './app/QuickLogContext'
import { ensureDatabaseReady } from './db/bootstrap'

void ensureDatabaseReady()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <QuickLogProvider>
          <App />
        </QuickLogProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
