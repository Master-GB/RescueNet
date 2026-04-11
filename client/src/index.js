import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import reportWebVitals from './reportWebVitals';

const API_BASE_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

if (typeof window !== 'undefined' && typeof window.fetch === 'function' && API_BASE_URL) {
  const nativeFetch = window.fetch.bind(window);

  window.fetch = (input, init = {}) => {
    const requestUrl = typeof input === 'string' ? input : input?.url;
    const isApiPath = typeof requestUrl === 'string' && requestUrl.startsWith('/api');

    if (!isApiPath) {
      return nativeFetch(input, init);
    }

    const resolvedInput = typeof input === 'string'
      ? `${API_BASE_URL}${input}`
      : new Request(`${API_BASE_URL}${requestUrl}`, input);

    const resolvedInit = {
      ...init,
      credentials: init.credentials || 'include',
    };

    return nativeFetch(resolvedInput, resolvedInit);
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
