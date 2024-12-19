import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DriveDataProvider } from './components/drivedata.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DriveDataProvider>
      <App />
    </DriveDataProvider>
  </StrictMode>,
)
