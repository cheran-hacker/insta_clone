import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// This line looks for <div id="root"> in index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  // <React.StrictMode> can sometimes double-render in dev, 
  // you can remove it if it causes confusion, but it's good practice.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);  