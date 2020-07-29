import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { RecoilRoot } from 'recoil';
import * as serviceWorker from './serviceWorker';
import { ClientProvider } from './contexts/ClientContext';

(ReactDOM as any).createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <React.Suspense fallback={null}>
      <RecoilRoot>
        <ClientProvider>
          <App />
        </ClientProvider>
      </RecoilRoot>
    </React.Suspense>
  </React.StrictMode>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
