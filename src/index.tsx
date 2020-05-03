// import React from 'react';
// import ReactDOM from 'react-dom';
// import { App } from './App';
import * as serviceWorker from './serviceWorker';

import { testing } from './testing';
testing();

// (ReactDOM as any).createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// );

// import { connect } from './data/system/core';
// connect();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
