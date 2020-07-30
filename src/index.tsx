import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import { ClientProvider } from './contexts/client/ClientContext';
import { store, persistor } from './store/store';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { CircularProgress } from '@material-ui/core';

(ReactDOM as any).createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <React.Suspense fallback={null}>
      <BrowserRouter>
        <Provider store={store}>
          <PersistGate loading={<CircularProgress />} persistor={persistor}>
            <ClientProvider>
              <App />
            </ClientProvider>
          </PersistGate>
        </Provider>
      </BrowserRouter>
    </React.Suspense>
  </React.StrictMode>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
