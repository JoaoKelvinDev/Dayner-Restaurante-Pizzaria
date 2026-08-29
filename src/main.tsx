import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AdminApp from './admin/AdminApp.tsx'

/*
 * Roteamento simples por pathname.
 *
 * Não usamos react-router aqui porque o app
 * tem só duas "telas raiz": o cardápio (/) e
 * o painel administrativo (/admin).
 */
const ehAdmin = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {ehAdmin ? <AdminApp /> : <App />}
  </StrictMode>,
)
