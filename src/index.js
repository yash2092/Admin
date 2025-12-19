import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './admin/styles/admin/ui/base.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

/**
 * Application entry point.
 *
 * WHY this file is intentionally small:
 * - It should only bootstrap React and global styles.
 * - App-level routing and UI logic belongs inside `App`.
 */

const rootElement = document.getElementById('root');
const reactRoot = ReactDOM.createRoot(rootElement);

reactRoot.render(
  <React.StrictMode>
    {/* WHY StrictMode:
        Helps catch common React pitfalls during development (double-invokes some lifecycles). */}
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
