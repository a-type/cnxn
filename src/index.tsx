import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import { ClientProvider } from './contexts/client/ClientContext';
import { store } from './store/store';

(ReactDOM as any).createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <React.Suspense fallback={null}>
      <Provider store={store}>
        <ClientProvider>
          <App />
        </ClientProvider>
      </Provider>
    </React.Suspense>
  </React.StrictMode>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
