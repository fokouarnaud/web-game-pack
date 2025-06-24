import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import AppRouter from './components/AppRouter'
import { ThemeProvider } from './components/theme/ThemeProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="dialect-game-ui-theme">
      <AppRouter />
    </ThemeProvider>
  </StrictMode>,
)
