import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// StrictMode disabled temporarily to fix Privy AbortError
// StrictMode causes double-rendering which aborts Privy initialization
createRoot(document.getElementById('root')!).render(
  <App />
)
