import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ServerStatusGate from './components/ServerStatusGate';
import './App.css';
import '@fontsource/quicksand/700.css';

const SERVER_URL = import.meta.env.VITE_API_URL ?? 'https://daggerheart-tools-4v1t.onrender.com/api';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <BrowserRouter>
    <ServerStatusGate serverUrl={SERVER_URL}>
      <App serverUrl={SERVER_URL} />
    </ServerStatusGate>
  </BrowserRouter>
);
