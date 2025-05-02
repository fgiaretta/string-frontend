import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ApiEnvironmentProvider } from './context/ApiEnvironmentContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApiEnvironmentProvider>
      <App />
    </ApiEnvironmentProvider>
  </React.StrictMode>,
)
