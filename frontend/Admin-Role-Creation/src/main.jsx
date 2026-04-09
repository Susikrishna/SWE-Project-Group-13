// main.jsx — Standalone dev entry point ONLY.
// BrowserRouter lives here so you can run `npm run dev` in isolation.
// When this MFE is consumed as a remote by the host shell, this file
// is never executed — the shell provides the router context instead.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
