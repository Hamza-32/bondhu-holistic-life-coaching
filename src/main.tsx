import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import '@/lib/i18n';
import { App } from '@/app/App';

// The pre-Supabase MVP kept journals and mood data in localStorage. That data is not migrated
// (docs/ARCHITECTURE.md §6.1): remove it so it never lingers on shared devices.
try {
  localStorage.removeItem('bondhu-storage');
  localStorage.removeItem('bondhu-last-user');
} catch {
  // Storage unavailable (e.g. private mode): nothing to clean up.
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
