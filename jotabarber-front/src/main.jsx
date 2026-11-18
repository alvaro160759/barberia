import ReactDOM from 'react-dom/client';
import { Suspense, StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import App from './app';
import { CONFIG } from './config-global';
import { ReduxProvider } from './redux/redux-provider';

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <ReduxProvider>
      <HelmetProvider>
        <BrowserRouter basename={CONFIG.site.basePath}>
          <Suspense>
            <App />
          </Suspense>
        </BrowserRouter>
      </HelmetProvider>
    </ReduxProvider>
  </StrictMode>
);
