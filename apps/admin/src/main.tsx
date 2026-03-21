import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { ApiProvider } from './api/provider';
import { AuthProvider } from './auth/AuthProvider';
import { ColorModeProvider } from './theme/ColorMode';

const container = document.getElementById('root');
createRoot(container!).render(
  <React.StrictMode>
    <ColorModeProvider>
      <AuthProvider>
        <ApiProvider>
          <App />
        </ApiProvider>
      </AuthProvider>
    </ColorModeProvider>
  </React.StrictMode>,
);
